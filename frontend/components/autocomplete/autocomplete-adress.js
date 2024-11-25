// This call describes an input with an autocomplete for adresses.
class AutoCompleteAdress extends HTMLElement {
    // observedAttributes is used to retrieve the parameters passed to a component.
    static get observedAttributes() {
      return ["name"];
    }

    constructor() {
      super();

      let shadowRoot = this.attachShadow({ mode: "open" });

      // This will be used to call instance methods inside the .then() following the fetch.
      let context = this;

      fetch("components/autocomplete/autocomplete-adress.html").then(async function(response) {
        let htmlContent = await response.text();
        // DOMParser contains methods to create DOM element, parseFromString creates an HTML page with the given content, and then we just have to retrieve the template.
        let templateContent = new DOMParser().parseFromString(htmlContent, "text/html").querySelector("template").content;
        shadowRoot.appendChild(templateContent.cloneNode(true));

        context.setupLogic();
      });
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }

    /* We will call the autocomplete API once the user has stopped typing for a given period (1000ms). To do so:
    ** 1) Instead of calling directly the API whenever a user type a letter, we will call a setTimeout that will call the API after 1s.
    ** 2) Whenever a key is pressed, we cancel the previous setTimeout if any (by calling clearTimeout) and create a new setTimeout
    ** 3) If no key is pressed for 1s, the setTimeout's callback function will naturally be executed and the call will be performed.
    */
    setupLogic() {
      let context = this;
      this.callTimeout = 0;

      const input = this.shadowRoot.querySelector("input");

      input.addEventListener("keydown", function(e) {

        if (this.callTimeout) clearTimeout(this.callTimeout);

        this.callTimeout = setTimeout(function(){
          let inputContent = input.value.replaceAll(" ", "+")
          let url = `https://api-adresse.data.gouv.fr/search/?q=${inputContent}&limit=5`;
          fetch(url).then(response => response.json().then(data => {
            context.updateAutoCompleteList(data.features);
          }));
        }, 1000);
      })
    }

    /* This method puts each adress in a <li> and warn whoever is listening whenever an option is selected. */
  updateAutoCompleteList(adresses) {
    let context = this;

    let datalist = this.shadowRoot.getElementById("suggestion");
    datalist.innerHTML = "";

    for (let adress of adresses) {
      let option = document.createElement("option");
      option.value = adress.properties.label;
      console.log("reçu "+ adress.properties.label);

      option.addEventListener("click", function() {
        let event = new CustomEvent("optionChosen", {
          detail: {
            name: context.name,
            adress: adress
          }
        });
        document.dispatchEvent(event);
      });

      datalist.appendChild(option);
    }
    console.log("ajouté " + datalist.firstChild.nodeValue);
  }
  }

customElements.define("auto-complete-input", AutoCompleteAdress);

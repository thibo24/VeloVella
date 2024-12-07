// This call describes an input with an autocomplete for addresses.
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

    fetch("components/autocomplete/autocomplete-adress.html").then(async function (response) {
      let htmlContent = await response.text();
      let templateContent = new DOMParser().parseFromString(htmlContent, "text/html").querySelector("template").content;
      shadowRoot.appendChild(templateContent.cloneNode(true));

      context.setupLogic();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
  }

  /* Setup logic to handle autocomplete functionality */
  setupLogic() {
    let context = this;
    this.callTimeout = 0;

    const input = this.shadowRoot.querySelector("input");

    // Listener for input value change
    input.addEventListener("input", function (e) {
      const selectedValue = e.target.value.trim();
      console.log("Valeur dans l'input :", selectedValue);

      // Vérifier si le champ contient des coordonnées GPS
      const gpsCoords = parseGpsCoordinates(selectedValue);
      if (gpsCoords) {
        console.log("Coordonnées GPS détectées :", gpsCoords);

        // Émettre un événement personnalisé avec les coordonnées GPS
        const gpsEvent = new CustomEvent("optionChosen", {
          detail: {
            name: context.name,
            adress: {
              geometry: { coordinates: [gpsCoords.lng, gpsCoords.lat] },
            },
          },
        });
        document.dispatchEvent(gpsEvent);
        return;
      }

      // Continuer avec la logique existante pour les adresses
      const datalist = context.shadowRoot.getElementById("suggestion");
      const selectedOption = Array.from(datalist.options).find(
        (option) => option.value === selectedValue
      );

      if (selectedOption) {
        console.log("Option correspondante trouvée :", selectedOption.value);

        const addressData = JSON.parse(selectedOption.dataset.adress);
        console.log("Données associées :", addressData);

        // Émettre l'événement personnalisé
        let event = new CustomEvent("optionChosen", {
          detail: {
            name: context.name,
            adress: addressData,
          },
        });
        document.dispatchEvent(event);
      }
    });

    // Debounced API call for autocomplete suggestions
    input.addEventListener("keydown", function () {
      if (context.callTimeout) clearTimeout(context.callTimeout);

      context.callTimeout = setTimeout(function () {
        const inputContent = input.value.replaceAll(" ", "+");
        const url = `https://api-adresse.data.gouv.fr/search/?q=${inputContent}&limit=5`;
        console.log("Requête API :", url);

        fetch(url)
          .then(response => response.json())
          .then(data => {
            console.log("Données API reçues :", data.features);
            context.updateAutoCompleteList(data.features);
          })
          .catch(err => console.error("Erreur API :", err));
      }, 1000);
    });
  }

  /* This method populates the datalist with options and stores address data */
  updateAutoCompleteList(adresses) {
    let datalist = this.shadowRoot.getElementById("suggestion");
    datalist.innerHTML = ""; // Clear previous suggestions

    console.log("Mise à jour des suggestions...");

    for (let adress of adresses) {
      let option = document.createElement("option");
      option.value = adress.properties.label;
      option.dataset.adress = JSON.stringify(adress); // Store address data in the dataset
      console.log("Ajout de l'option :", adress.properties.label);

      datalist.appendChild(option);
    }

    console.log("Suggestions mises à jour :", datalist.options);
  }
}

customElements.define("auto-complete-input", AutoCompleteAdress);

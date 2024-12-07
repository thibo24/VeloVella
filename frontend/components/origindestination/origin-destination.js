// This class is a container for 2 subcomponents defining origin and destination.
class OriginDestination extends HTMLElement {
  constructor() {
    super();

    let shadowRoot = this.attachShadow({ mode: "open" });

    fetch("components/origindestination/origin-destination.html").then(async function (response) {
      let htmlContent = await response.text();
      let templateContent = new DOMParser().parseFromString(htmlContent, "text/html").querySelector("template").content;

      shadowRoot.appendChild(templateContent.cloneNode(true));

      // Listen for custom events triggered by the autocomplete components
      document.addEventListener("optionChosen", function (event) {
        console.log(`Selected ${event.detail.name} point:`, event.detail.adress);

        const { name, adress } = event.detail;

        if (adress && adress.geometry && adress.geometry.coordinates) {
          const [lng, lat] = adress.geometry.coordinates;
          console.log("Coordinates received:", { lng, lat });

          // Call the global functions defined in map.js
          if (name === "start") {
            console.log("origin");
            window.updateStartMarker(lat, lng); // Update start marker
          } else if (name === "end") {
            window.updateEndMarker(lat, lng); // Update end marker
          }
        } else {
          console.error("Invalid address data:", adress);
        }
      });
    });
  }
}

customElements.define("origin-destination", OriginDestination);

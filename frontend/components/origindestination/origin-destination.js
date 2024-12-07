// This class is a container for 2 subcomponents defining origin and destination.
class OriginDestination extends HTMLElement {
  constructor() {
    super();

    let shadowRoot = this.attachShadow({ mode: "open" });

    fetch("components/origindestination/origin-destination.html").then(async function (response) {
      let htmlContent = await response.text();
      let templateContent = new DOMParser()
        .parseFromString(htmlContent, "text/html")
        .querySelector("template").content;

      shadowRoot.appendChild(templateContent.cloneNode(true));

      // Listen for custom events triggered by the autocomplete components
      document.addEventListener(
        "optionChosen",
        function (event) {
          console.log(`Selected ${event.detail.name} point:`, event.detail.adress);

          const { name, adress } = event.detail;

          if (adress && adress.geometry && adress.geometry.coordinates) {
            const [lng, lat] = adress.geometry.coordinates;
            console.log("Coordinates received:", { lng, lat });

            // Call the global functions defined in map.js
            if (name === "start") {
              window.updateStartMarker(lat, lng); // Update start marker
            } else if (name === "end") {
              window.updateEndMarker(lat, lng); // Update end marker
            }
          } else {
            showPopup("error", `Le point ${name === "start" ? "de départ" : "d'arrivée"} est invalide`);
          }
        }.bind(this)
      );

      // Add an event listener for the search button
      const searchButton = shadowRoot.getElementById("search-button");
      searchButton.addEventListener("click", () => {
        console.log("Search button clicked");

        const originInput = document.querySelector("auto-complete-input[name='start']").shadowRoot.querySelector("input");
        const destinationInput = document.querySelector("auto-complete-input[name='end']").shadowRoot.querySelector("input");

        const originValue = originInput?.value || "";
        const destinationValue = destinationInput?.value || "";

        // Check if fields are filled
        if (!originValue) {
          showPopup("error", "Veuillez renseigner une adresse de départ");
          return;
        }
        if (!destinationValue) {
          showPopup("error", "Veuillez renseigner une adresse d'arrivée");
          return;
        }

        // Validate the addresses by simulating API verification
        validateAddress(originValue, "start");
        validateAddress(destinationValue, "end");

        fetch("mock-data/Response.geojson") // Chemin relatif vers votre fichier
          .then((response) => response.json())
          .then((geojsonData) => {
            displayRoutesOnMap(geojsonData); // Appel de la fonction pour afficher les trajets
          })
          .catch((error) => console.error("Erreur lors du chargement des données GeoJSON:", error));
      });
    });
  }
}

/**
 * Display a popup with a custom message
 * @param {string} type - "error" or "info"
 * @param {string} message - The message to display in the popup
 */
function showPopup(type, message) {
  const popup = document.getElementById(`${type}-pop-up`);
  const popupText = popup.querySelector(".pop-up-text");

  // Update the message
  popupText.textContent = message;

  // Show the popup
  popup.classList.add("visible");

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove("visible");
  }, 3000);
}

/**
 * Validate an address and show an error popup if invalid
 * @param {string} address - The address to validate
 * @param {string} fieldName - "start" ou "end"
 */
function validateAddress(address, fieldName) {
  console.log(`Validating address for ${fieldName}:`, address);

  // Construire l'URL pour appeler l'API de validation
  const url = `https://api-adresse.data.gouv.fr/search/?q=${address.replaceAll(" ", "+")}&limit=1`;

  // Appeler l'API pour valider l'adresse
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Vérifier si l'API renvoie des coordonnées
      if (data.features && data.features.length > 0 && data.features[0].geometry) {
        const [lng, lat] = data.features[0].geometry.coordinates;

        console.log(`Adresse valide pour ${fieldName}:`, { lng, lat });

        // Mettre à jour le marqueur sur la carte
        if (fieldName === "start") {
          window.updateStartMarker(lat, lng);
        } else if (fieldName === "end") {
          window.updateEndMarker(lat, lng);
        }
      } else {
        // Si aucune coordonnée n'est trouvée, afficher une pop-up d'erreur
        showPopup(
          "error",
          `Veuillez renseigner une adresse ${fieldName === "start" ? "de départ" : "d'arrivée"} valide`
        );
      }
    })
    .catch((err) => {
      console.error(`Erreur lors de la validation de l'adresse pour ${fieldName}:`, err);
      showPopup(
        "error",
        `Une erreur est survenue lors de la validation de l'adresse ${fieldName === "start" ? "de départ" : "d'arrivée"}`
      );
    });
}

customElements.define("origin-destination", OriginDestination);

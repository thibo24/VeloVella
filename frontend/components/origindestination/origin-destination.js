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

      // Gestion des boutons de géolocalisation
      const geoStartButton = shadowRoot.getElementById("geo-start");
      const geoEndButton = shadowRoot.getElementById("geo-end");

      geoStartButton.addEventListener("click", () => useGeolocation("start"));
      geoEndButton.addEventListener("click", () => useGeolocation("end"));

      const searchButton = shadowRoot.getElementById("search-button");
      searchButton.addEventListener("click", async () => {
        // Récupérez et validez les valeurs comme avant
        const originInput = document.querySelector("auto-complete-input[name='start']").shadowRoot.querySelector("input");
        const destinationInput = document.querySelector("auto-complete-input[name='end']").shadowRoot.querySelector("input");

        const originValue = originInput?.value || "";
        const destinationValue = destinationInput?.value || "";

        if (!originValue) {
          showPopup("error", "Veuillez renseigner une adresse de départ");
          return;
        }
        if (!destinationValue) {
          showPopup("error", "Veuillez renseigner une adresse d'arrivée");
          return;
        }

        try {
          const originCoords = await validateAddress(originValue, "start");
          const destinationCoords = await validateAddress(destinationValue, "end");

          if (!originCoords || !destinationCoords) return;

          const cityData = [
            {
              CityName: originValue,
              CoordinateX: originCoords.lat.toString(),
              CoordinateY: originCoords.lng.toString(),
            },
            {
              CityName: destinationValue,
              CoordinateX: destinationCoords.lat.toString(),
              CoordinateY: destinationCoords.lng.toString(),
            },
          ];

          console.log("Data to send:", cityData);

          fetch("http://localhost:8080/calculateRoutes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cityData),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Server response:", data);
              displayRoutesOnMap(data);
            })
            .catch((error) => {
              console.error("Erreur lors de l'envoi des données :", error);
              showPopup("error", "Erreur lors de l'envoi des données");
            });
        } catch (error) {
          console.error("Erreur pendant la validation ou l'envoi :", error);
        }
      });
    });

    /**
     * Utiliser la géolocalisation pour un champ donné (start ou end)
     * @param {string} fieldName - "start" ou "end"
     */
    function useGeolocation(fieldName) {
      if (!navigator.geolocation) {
        showPopup("error", "La géolocalisation n'est pas prise en charge par votre navigateur.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Géolocalisation pour ${fieldName}:`, { latitude, longitude });

          // Afficher le marqueur sur la carte
          if (fieldName === "start") {
            window.updateStartMarker(latitude, longitude);
            document.querySelector("auto-complete-input[name='start']").shadowRoot.querySelector("input").value =
              `${latitude}, ${longitude}`;
          } else if (fieldName === "end") {
            window.updateEndMarker(latitude, longitude);
            document.querySelector("auto-complete-input[name='end']").shadowRoot.querySelector("input").value =
              `${latitude}, ${longitude}`;
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation :", error);
          showPopup("error", "Impossible d'obtenir votre position.");
        }
      );
    }
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
 * Check if the input is in GPS coordinates format (lat, lng)
 * @param {string} input - The user input
 * @returns {{ lat: number, lng: number } | null} Coordinates or null if invalid
 */
function parseGpsCoordinates(input) {
  const gpsRegex = /^\s*([+-]?\d+(\.\d+)?),\s*([+-]?\d+(\.\d+)?)\s*$/;
  const match = input.match(gpsRegex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);

    // Validate latitude and longitude ranges
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}


async function validateAddress(input, fieldName) {
  console.log(`Validating address for ${fieldName}:`, input);

  // Check if the input is GPS coordinates
  const gpsCoords = parseGpsCoordinates(input);
  if (gpsCoords) {
    console.log(`GPS coordinates detected for ${fieldName}:`, gpsCoords);
    if (fieldName === "start") {
      window.updateStartMarker(gpsCoords.lat, gpsCoords.lng);
    } else if (fieldName === "end") {
      window.updateEndMarker(gpsCoords.lat, gpsCoords.lng);
    }
    return gpsCoords; // Return the coordinates
  }

  // Otherwise, treat the input as an address
  const url = `https://api-adresse.data.gouv.fr/search/?q=${input.replaceAll(" ", "+")}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0 && data.features[0].geometry) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      console.log(`Adresse valide pour ${fieldName}:`, { lat, lng });
      if (fieldName === "start") {
        window.updateStartMarker(lat, lng);
      } else if (fieldName === "end") {
        window.updateEndMarker(lat, lng);
      }
      return { lat, lng };
    } else {
      showPopup(
        "error",
        `Veuillez renseigner une adresse ${fieldName === "start" ? "de départ" : "d'arrivée"} valide`
      );
      return null;
    }
  } catch (err) {
    console.error(`Erreur lors de la validation de l'adresse pour ${fieldName}:`, err);
    showPopup(
      "error",
      `Une erreur est survenue lors de la validation de l'adresse ${fieldName === "start" ? "de départ" : "d'arrivée"}`
    );
    return null;
  }
}


customElements.define("origin-destination", OriginDestination);

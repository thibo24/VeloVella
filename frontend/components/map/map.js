document.addEventListener("DOMContentLoaded", () => {
  // Initialize the map and expose it globally
  window.map = L.map('map', {
    zoomControl: false // Disable default controls
  }).setView([48.8566, 2.3522], 13); // Default view centered on Paris

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(window.map);

  // Add zoom controls in the top right
  L.control.zoom({
    position: 'topright'
  }).addTo(window.map);

  // Define global variables for the start and end markers
  window.startCircle = null;
  window.endMarker = null;

  // Function to add or update the start marker
  window.updateStartMarker = (lat, lng) => {
    if (!lat || !lng) {
      return;
    }
    if (window.startCircle) {
      window.startCircle.setLatLng([lat, lng]);
    } else {
      window.startCircle = L.circle([lat, lng], {
        title: "Départ",
        color: "#5993CA",
        fillColor: "#5993CA",
        fillOpacity: 0.5,
        radius: 100
      }).addTo(window.map);
    }
    window.map.setView([lat, lng], 13); // Center the map on the marker
  };

  // Function to add or update the end marker
  window.updateEndMarker = (lat, lng) => {
    if (!lat || !lng) {
      return;
    }
    if (window.endMarker) {
      window.endMarker.setLatLng([lat, lng]);
    } else {
      window.endMarker = L.marker([lat, lng], { title: "Arrivée" }).addTo(window.map);
    }
    window.map.setView([lat, lng], 13); // Center the map on the marker
  };
});

function displayRoutesOnMap(geojsonData) {
  // Définir les styles pour les trajets à pied et à vélo
  const walkStyle = {
    color: "#5993CA",
    dashArray: "5, 5", // Pointillés
    weight: 3,
  };

  const bikeStyle = {
    color: "#5993CA",
    weight: 3, // Traits pleins
  };

  // Parcourir chaque feature dans le GeoJSON
  geojsonData.features.forEach((feature) => {
    const coordinates = feature.geometry.coordinates.map((coord) => [coord[1], coord[0]]); // Inverser [lng, lat] -> [lat, lng]

    // Déterminer si le trajet est à pied ou en vélo
    const mode = feature.properties.mode; // Exemple: "WALK" ou "BIKE"
    const style = mode === "WALK" ? walkStyle : bikeStyle;

    // Ajouter le trajet sur la carte
    L.polyline(coordinates, style).addTo(window.map);
  });
}

document.getElementById("search-button").addEventListener("click", () => {
  // Charger les données GeoJSON (remplacez 'path/to/geojson' par le chemin réel ou une URL)
  fetch("path/to/Response.geojson")
    .then((response) => response.json())
    .then((geojsonData) => {
      displayRoutesOnMap(geojsonData);
    })
    .catch((error) => console.error("Erreur lors du chargement des données GeoJSON:", error));
});


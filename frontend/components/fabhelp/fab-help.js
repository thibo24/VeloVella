class FabHelp extends HTMLElement {
  constructor() {
    super();

    // Créez le Shadow DOM
    const shadowRoot = this.attachShadow({ mode: "open" });

    // Charger le fichier HTML du composant
    fetch("components/fabhelp/fab-help.html")
      .then((response) => response.text())
      .then((htmlContent) => {
        // Parsez le contenu HTML et récupérez le template
        const templateElement = document.createElement("div");
        templateElement.innerHTML = htmlContent.trim();

        const templateContent = templateElement.querySelector("template").content;
        shadowRoot.appendChild(templateContent.cloneNode(true)); // Ajoutez le contenu du template au shadowRoot

        // Configurez les événements après avoir ajouté le contenu au shadowRoot
        this.setupLogic();
      })
      .catch((err) => console.error("Erreur lors du chargement de fab-help.html :", err));
  }

  /**
   * Configure les événements pour le bouton et la popup
   */
  setupLogic() {
    const fabHelp = this.shadowRoot.querySelector("#fab-help");
    const helpPopup = this.shadowRoot.querySelector("#help-pop-up");
    const closeHelpButton = this.shadowRoot.querySelector(".pop-up-close-button");

    if (!fabHelp || !helpPopup || !closeHelpButton) {
      console.error("Erreur : certains éléments du composant FabHelp sont introuvables.");
      return;
    }

    const toggleHelpPopup = () => {
      helpPopup.classList.toggle("hidden");
    };

    fabHelp.addEventListener("click", toggleHelpPopup);
    closeHelpButton.addEventListener("click", toggleHelpPopup);
  }
}

// Définir le Custom Element
customElements.define("fab-help", FabHelp);

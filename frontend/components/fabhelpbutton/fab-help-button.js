document.addEventListener("DOMContentLoaded", () => {
  const fabHelpButton = document.getElementById("fab-help");
  const helpPopup = document.getElementById("help-pop-up");
  const closeHelpButton = helpPopup.querySelector(".pop-up-close-button");

  function toggleHelpPopup() {
    helpPopup.classList.toggle("hidden");
  }

  fabHelpButton.addEventListener("click", toggleHelpPopup);

  closeHelpButton.addEventListener("click", toggleHelpPopup);
});

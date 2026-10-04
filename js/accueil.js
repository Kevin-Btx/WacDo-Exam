document.addEventListener("DOMContentLoaded", () => {
    Panier.reinitialiserCommande();

    const boutonSurPlace = document.getElementById("btn-sur-place");
    const boutonAEmporter = document.getElementById("btn-a-emporter");

    boutonSurPlace.addEventListener("click", () => demarrerCommande("sur-place"));
    boutonAEmporter.addEventListener("click", () => demarrerCommande("a-emporter"));

    function demarrerCommande(mode) {
        Panier.setMode(mode);
        window.location.href = "commande.html";
    }
});
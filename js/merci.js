document.addEventListener("DOMContentLoaded", () => {
    const donnees = sessionStorage.getItem("wacdo_derniere_commande");
    const elNumero = document.getElementById("merci-numero");

    if (donnees) {
        const commande = JSON.parse(donnees);
        elNumero.textContent =
            commande.mode === "sur-place"
                ? "Commande n°" + commande.numeroCommande + "— Table n° " + commande.numeroChevalet
                : "Commande n°" + commande.numeroCommande + "— A récupérer au comptoir";
    } else {
        elNumero.textContent = "";
    }

    document.getElementById("btn-nouvelle-commande").addEventListener("click", () => {
        Panier.reinitialiserCommande();
        sessionStorage.removeItem("wacdo_derniere_commande");
        window.location.href = "index.html";
    });
});
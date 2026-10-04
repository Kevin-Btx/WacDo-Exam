document.addEventListener("DOMContentLoaded", () => {
    if (Panier.getMode() !== "sur-place" || Panier.getArticles().length === 0) {
        window.location.href = "index.html";
        return;
    }

    const chiffres = [
        document.getElementById("chiffre-1"),
        document.getElementById("chiffre-2"),
        document.getElementById("chiffre-3"),
    ];

    chiffres.forEach((champ, index) => {
        champ.addEventListener("input", () => {
            champ.value = champ.value.replace(/[^0-9]/g, "");
            if (champ.value && index < chiffres.length - 1) {
                chiffres[index + 1].focus();
            }
        });
        champ.addEventListener("keydown", (evenement) => {
            if (evenement.key === "Backspace" && !champ.value && index > 0) {
                chiffres[index - 1].focus();
            }
        });
    });

    document.getElementById("form-chevalet").addEventListener("submit", (evenement) => {
        evenement.preventDefault();
        const numeroChevalet = chiffres.map((champ) => champ.value).join("");
        if (numeroChevalet.length !== 3) {
            alert("Merci de renseigner les 3 chiffres du chevalet.");
            return;
        }
        Panier.setNumeroChevalet(numeroChevalet);

        const boutonEnregistrer = document.getElementById("btn-enregistrer");
        boutonEnregistrer.disabled = true;
        boutonEnregistrer.textContent = "Envoi en cours...";

        Panier.envoyerCommande(numeroChevalet);
    });
});
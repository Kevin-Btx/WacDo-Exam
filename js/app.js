let categorieActive = "menus";

const elListeCategories = document.getElementById("liste-categories");
const elFlecheGauche = document.getElementById("fleche-gauche");
const elFlecheDroite = document.getElementById("fleche-droite");
const elTitreCategorie = document.getElementById("titre-categorie");
const elSousTitreCategorie = document.getElementById("soustitre-categorie");
const elGrilleProduits = document.getElementById("grille-produits");

const elPanierNumero = document.getElementById("panier-numero");
const elPanierListe = document.getElementById("panier-liste");
const elPanierVide = document.getElementById("panier-vide");
const elPanierTotal = document.getElementById("panier-total");
const elBtnAbandon = document.getElementById("btn-abandon");
const elBtnPayer = document.getElementById("btn-payer");

const SOUS_TITRES = {
    menus: "Un sandwich, un accompagnement et une boisson",
    burgers: "Nos sandwiches signature",
    wraps: "Fraîcheur et gourmandise à emporter",
    frites: "La pomme de terre dans tous ses états",
    boissons: "Une petite soif, sucrée, légére, rafraîchissante",
    encas: "Pour les petites faims",
    desserts: "Une touche sucrée pour finir en beauté",
    salades: "Fraîches et équilibrées",
    sauces: "Pour accompagner votre repas",
};

document.addEventListener("DOMContentLoaded", async () => {
    if (!Panier.getMode()) {
        window.location.href = "index.html";
        return;
    }

    elPanierNumero.textContent = Panier.getNumeroCommande();

    try {
        const categories = await Donnees.chargerCategories();
        await Donnees.chargerProduits();
        afficherCategories(categories);
        await afficherProduits(categorieActive);
    } catch (erreur) {
        elTitreCategorie.textContent = "erreur de chargement";
        elSousTitreCategorie.textContent = erreur.message;
        console.error(erreur);
    }

    afficherPanier();

    elFlecheGauche.addEventListener("click", () => elListeCategories.scrollBy({ left: -200, behavior: "smooth" }));
    elFlecheDroite.addEventListener("click", () => elListeCategories.scrollBy({ left: 200, behavior: "smooth" }));

    elBtnAbandon.addEventListener("click", gererAbandon);
    elBtnPayer.addEventListener("click", gererPayer);

    initModaleSimple();
    initModaleMenu();
});

function afficherCategories(categories) {
    elListeCategories.innerHTML = "";
    categories.forEach((categorie) => {
        const li = document.createElement("li");
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "categorie-btn";
        bouton.setAttribute("aria-current", categorie.title === categorieActive ? "true" : "false");
        bouton.innerHTML = `<img src="${categorie.image}" alt="" /><span>${categorie.label}</span>`;
        bouton.addEventListener("click", async () => {
            categorieActive = categorie.title;
            document.querySelectorAll(".categorie-btn")
                .forEach((btn) => btn.setAttribute("aria-current", "false"));
            bouton.setAttribute("aria-current", "true");
            await afficherProduits(categorieActive);
        });
        li.appendChild(bouton);
        elListeCategories.appendChild(li);
    });
}

async function afficherProduits(cle) {
    const categories = await Donnees.chargerCategories();
    const infoCategorie = categories.find((c) => c.title === cle);

    elTitreCategorie.textContent = "Nos " + (infoCategorie ? infoCategorie.label.toLowerCase() : cle);
    elSousTitreCategorie.textContent = SOUS_TITRES[cle]

    const produits = await Donnees.getProduitsParCategorie(cle);
    elGrilleProduits.innerHTML = "";

    produits.forEach((produit) => {
        const li = document.createElement("li");
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "produit-carte";
        bouton.innerHTML = `
    <img src="${produit.image}" alt="${produit.nom}" />
    <span class="produit-carte__nom">${produit.nom}</span>
    <span class="produit-carte__prix">${Panier.formaterPrix(produit.prix)}</span>
    `;
        bouton.addEventListener("click", () => {
            if (cle === "menus") {
                ouvrirModaleMenu(produit);
            } else {
                ouvrirModaleSimple(produit, cle);
            }
        });
        li.appendChild(bouton);
        elGrilleProduits.appendChild(li);
    })
}

function afficherPanier() {
    const articles = Panier.getArticles();
    elPanierListe.innerHTML = "";

    if (articles.length === 0) {
        elPanierVide.hidden = false;
    } else {
        elPanierVide.hidden = true;
        articles.forEach((article, index) => {
            const li = document.createElement("li");
            li.className = "panier__article";
            const details = (article.details || [])
                .map((ligne) => `<li>${ligne}</li>`)
                .join("");
            li.innerHTML = `
             <div class="panier__article-entete">
          <span>${article.quantite} ${article.nom}</span>
          <button type="button" class="panier__supprimer" aria-label="Supprimer ${article.nom}">
            <img src="images/images/trash.png" alt="" />
          </button>
        </div>
        ${details ? `<ul>${details}</ul>` : ""}
      `;
            li.querySelector(".panier__supprimer").addEventListener("click", () => {
                Panier.supprimerArticle(index);
                afficherPanier();
            });
            elPanierListe.appendChild(li);
        });
    }

    elPanierTotal.textContent = Panier.formaterPrix(Panier.getTotal());
}

const SUPPLEMENT_GRANDE_TAILLE = 0.5;

const elModaleSimple = document.getElementById("modale-simple");
const elModaleSimpleTitre = document.getElementById("modale-simple-titre");
const elModaleSimpleTexte = document.getElementById("modale-simple-texte");
const elModaleSimpleTailles = document.getElementById("modale-simple-tailles");
const elModaleSimpleQte = document.getElementById("modale-simple-qte");

let etatSimple = null;

function initModaleSimple() {
    document.getElementById("modale-simple-fermer").addEventListener("click", fermerModaleSimple);
    document.getElementById("modale-simple-annuler").addEventListener("click", fermerModaleSimple);
    document.getElementById("modale-simple-moins").addEventListener("click", () => changerQuantite(-1));
    document.getElementById("modale-simple-plus").addEventListener("click", () => changerQuantite(+1));
    document.getElementById("modale-simple-ajouter").addEventListener("click", validerModaleSimple);
}

function ouvrirModaleSimple(produit, categorie) {
    etatSimple = { produit, categorie, quantite: 1, grandeTaille: false };

    elModaleSimpleTitre.textContent = categorie === "boissons" ? "Une petite soif?" : produit.nom;
    elModaleSimpleTexte.textContent =
        categorie === "boissons"
            ? "Choissisez la taille de votre boisson, +0,50€ pour le format 50 Cl"
            : "";

    if (categorie === "boissons") {
        elModaleSimpleTailles.hidden = false;
        elModaleSimpleTailles.innerHTML = `
      <button type="button" class="modale__option" data-taille="30" aria-pressed="true">
        <img src="${produit.image}" alt="" />30Cl
      </button>
      <button type="button" class="modale__option" data-taille="50" aria-pressed="false">
        <img src="${produit.image}" alt="" />50Cl
      </button>
    `;
        elModaleSimpleTailles.querySelectorAll(".modale__option").forEach((bouton) => {
            bouton.addEventListener("click", () => {
                elModaleSimpleTailles
                    .querySelectorAll(".modale__option")
                    .forEach((b) => b.setAttribute("aria-pressed", "false"));
                bouton.setAttribute("aria-pressed", "true");
                etatSimple.grandeTaille = bouton.dataset.taille === "50";
            });
        });
    } else {
        elModaleSimpleTailles.hidden = true;
        elModaleSimpleTailles.innerHTML = "";
    }

    elModaleSimpleQte.textContent = "1";
    elModaleSimple.hidden = false;
}

function changerQuantite(delta) {
    if (!etatSimple) return;
    etatSimple.quantite = Math.max(1, etatSimple.quantite + delta);
    elModaleSimpleQte.textContent = String(etatSimple.quantite);
}

function validerModaleSimple() {
    if (!etatSimple) return;
    const { produit, categorie, quantite, grandeTaille } = etatSimple;
    const prixUnitaire = produit.prix + (grandeTaille ? SUPPLEMENT_GRANDE_TAILLE : 0);
    const details = categorie === "boissons" ? [grandeTaille ? "Format 50 Cl" : "Format 30 Cl"] : [];

    Panier.ajouterArticle({
        nom: produit.nom,
        prixUnitaire,
        quantite,
        details
    });

    afficherPanier();
    fermerModaleSimple();
}

function fermerModaleSimple() {
    elModaleSimple.hidden = true;
    etatSimple = null;
}

const SUPPLEMENT_MENU_MAXI = 1.0;

const elModaleMenu = document.getElementById("modale-menu");
const elModaleMenuTitre = document.getElementById("modale-menu-titre");
const elModaleMenuTexte = document.getElementById("modale-menu-texte");
const elModaleMenuOptions = document.getElementById("modale-menu-options");
const elModaleMenuSuivant = document.getElementById("modale-menu-suivant");
const elModaleMenuRetour = document.getElementById("modale-menu-retour");

let etatMenu = null;

const ETAPES_MENU = ["taille", "accompagnement", "boisson", "sauce"];

function initModaleMenu() {
    document.getElementById("modale-menu-fermer").addEventListener("click", fermerModaleMenu);
    elModaleMenuRetour.addEventListener("click", () => allerEtape(-1));
    elModaleMenuSuivant.addEventListener("click", () => {
        const etapeCourante = ETAPES_MENU[etatMenu.etape];
        if (!selectionValide(etapeCourante)) return;
        if (etatMenu.etape === ETAPES_MENU.length - 1) {
            validerModaleMenu();
        } else {
            allerEtape(1);
        }
    });
}

function ouvrirModaleMenu(menu) {
    etatMenu = { menu, etape: 0, maxi: null, accompagnement: null, boisson: null, sauce: null };
    elModaleMenu.hidden = false;
    afficherEtapeMenu();
}

function allerEtape(delta) {
    etatMenu.etape += delta;
    afficherEtapeMenu();
}

function selectionValide(etape) {
    if (etape === "taille") return etatMenu.maxi !== null;
    if (etape === "accompagnement") return etatMenu.accompagnement !== null;
    if (etape === "boisson") return etatMenu.boisson !== null;
    if (etape === "sauce") return etatMenu.sauce !== null;
    return false;
}

async function afficherEtapeMenu() {
    const etape = ETAPES_MENU[etatMenu.etape];
    elModaleMenuRetour.hidden = etatMenu.etape === 0;
    elModaleMenuSuivant.textContent =
        etatMenu.etape === ETAPES_MENU.length - 1 ? "Ajouter le menu à ma commande" : "Etape suivante";
    if (etape === "taille") {
        elModaleMenuTitre.textContent = "Une grosse faim ?";
        elModaleMenuTexte.textContent =
            "Le menu Maxi comprend une grande frite et une grande boisson (+1,00€)";
        elModaleMenuOptions.innerHTML = `
      <button type="button" class="modale__option" data-maxi="1" aria-pressed="${etatMenu.maxi === true}">
        <img src="images/images/illustration-maxi-best-of.png" alt="" />
        Menu Maxi
      </button>
      <button type="button" class="modale__option" data-maxi="0" aria-pressed="${etatMenu.maxi === false}">
        <img src="images/images/illustration-best-of.png" alt="" />
        Menu Classique
      </button>
    `;
        elModaleMenuOptions.querySelectorAll(".modale__option").forEach((bouton) => {
            bouton.addEventListener("click", () => {
                etatMenu.maxi = bouton.dataset.maxi === "1";
                marquerSelection(bouton);
            });
        });
    }

    if (etape === "accompagnement") {
        const frites = await Donnees.getProduitsParCategorie("frites");
        const petite = frites.find((f) => f.nom === "Moyenne Frite");
        const grande = frites.find((f) => f.nom === "Grande Frite");
        const potatoesPetit = frites.find((f) => f.nom === "Potatoes");
        const potatoesGrand = frites.find((f) => f.nom === "Grande Potatoes");
        const fritesAffichees = etatMenu.maxi ? grande : petite;
        const potatoesAffichees = etatMenu.maxi ? potatoesGrand : potatoesPetit;


        elModaleMenuTitre.textContent = "Choisissez votre accompagnement";
        elModaleMenuTexte.textContent = "Frites, potatoes, la pomme de terre dans tous ses états";
        elModaleMenuOptions.innerHTML = `
      <button type="button" class="modale__option" data-acc="frites" aria-pressed="${etatMenu.accompagnement === "Frites"}">
        <img src="${fritesAffichees.image}" alt="" />Frites
      </button>
      <button type="button" class="modale__option" data-acc="potatoes" aria-pressed="${etatMenu.accompagnement === "Potatoes"}">
        <img src="${potatoesAffichees.image}" alt="" />Potatoes
      </button>
    `;
        elModaleMenuOptions.querySelectorAll(".modale__option").forEach((bouton) => {
            bouton.addEventListener("click", () => {
                etatMenu.accompagnement = bouton.dataset.acc === "frites" ? "Frites" : "Potatoes";
                marquerSelection(bouton);

            });
        });
    }

    if (etape === "boisson") {
        const boissons = await Donnees.getProduitsParCategorie("boissons");
        elModaleMenuTitre.textContent = "Choisissez votre boisson";
        elModaleMenuTexte.textContent = "Un soda, un jus de fruit ou un verre d'eau pour accompagner votre repas";
        elModaleMenuOptions.innerHTML = boissons
            .map(
                (boisson) => `
        <button type="button" class="modale__option" data-id="${boisson.id}" aria-pressed="${etatMenu.boisson && etatMenu.boisson.id === boisson.id}">
          <img src="${boisson.image}" alt="" />${boisson.nom}
        </button>`
            )
            .join("");
        elModaleMenuOptions.querySelectorAll(".modale__option").forEach((bouton) => {
            bouton.addEventListener("click", () => {
                etatMenu.boisson = boissons.find((b) => b.id === Number(bouton.dataset.id));
                marquerSelection(bouton);
            });
        });
    }

    if (etape === "sauce") {
        const sauces = await Donnees.getProduitsParCategorie("sauces");
        elModaleMenuTitre.textContent = "Choisissez votre sauce";
        elModaleMenuTexte.textContent = "Pour accompagner votre menu";
        elModaleMenuOptions.innerHTML = sauces
            .map(
                (sauce) => `
        <button type="button" class="modale__option" data-id="${sauce.id}" aria-pressed="${etatMenu.sauce && etatMenu.sauce.id === sauce.id}">
          <img src="${sauce.image}" alt="" />${sauce.nom}
        </button>`
            )
            .join("");
        elModaleMenuOptions.querySelectorAll(".modale__option").forEach((bouton) => {
            bouton.addEventListener("click", () => {
                etatMenu.sauce = sauces.find((s) => s.id === Number(bouton.dataset.id));
                marquerSelection(bouton);
            });
        });
    }
}

function marquerSelection(boutonClique) {
    elModaleMenuOptions
        .querySelectorAll(".modale__option")
        .forEach((b) => b.setAttribute("aria-pressed", "false"));
    boutonClique.setAttribute("aria-pressed", "true");
}
function validerModaleMenu() {
    const { menu, maxi, accompagnement, boisson, sauce } = etatMenu;
    const prixUnitaire = menu.prix + (maxi ? SUPPLEMENT_MENU_MAXI : 0);

    Panier.ajouterArticle({
        nom: menu.nom + (maxi ? " (Maxi)" : ""),
        prixUnitaire,
        quantite: 1,
        details: [accompagnement, boisson.nom, sauce.nom],
    });

    afficherPanier();
    fermerModaleMenu();
}

function fermerModaleMenu() {
    elModaleMenu.hidden = true;
    etatMenu = null;
}

function gererAbandon() {
    if (Panier.getArticles().length === 0) {
        window.location.href = "index.html";
        return;
    }
    const confirmation = window.confirm("Voulez-vous vraiment abandonner votre commande ?");
    if (confirmation) {
        Panier.reinitialiserCommande();
        window.location.href = "index.html";
    }
}

function gererPayer() {
    if (Panier.getArticles().length === 0) {
        alert("Votre panier est vide, ajoutez au moins un produit avant de valider");
        return;
    }

    if (Panier.getMode() === "sur-place") {
        // nb : si sur place on demande le n° du chevalet avant de terminer
        window.location.href = "fin-commande.html";
    } else {
        // si a emporter la commande est terminer directement
        Panier.envoyerCommande(null);
    }
}
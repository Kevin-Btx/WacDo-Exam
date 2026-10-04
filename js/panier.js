const Panier = {
    CLE_PANIER: "wacdo_panier",
    CLE_MODE: "wacdo_mode", // Note à moi même "sur-place" ou  "a-emporter"
    CLE_NUMERO: "wacdo_numero_commande",
    CLE_CHEVALET: "wacdo_numero_chevalet",

    getArticles() {
        const donnees = sessionStorage.getItem(this.CLE_PANIER);
        return donnees ? JSON.parse(donnees) : [];
    },
    // enregistrer la liste des article du panier 
    sauvegarderArticles(articles) {
        sessionStorage.setItem(this.CLE_PANIER, JSON.stringify(articles));
    },
    // ajouter un article 
    ajouterArticle(article) {
        const articles = this.getArticles();
        articles.push(article);
        this.sauvegarderArticles(articles);
    },
    // supprimer un article du panier 
    supprimerArticle(index) {
        const articles = this.getArticles();
        articles.splice(index, 1);
        this.sauvegarderArticles(articles);
    },

    // Vider le panier
    vider() {
        sessionStorage.removeItem(this.CLE_PANIER);
    },

    // Total du panier
    getTotal() {
        return this.getArticles().reduce(
            (total, article) => total + article.prixUnitaire * article.quantite,
            0
        );
    },

    // sur place ou a emporter
    setMode(mode) {
        sessionStorage.setItem(this.CLE_MODE, mode);
    },

    getMode() {
        return sessionStorage.getItem(this.CLE_MODE);
    },

    // numero de commande unique
    getNumeroCommande() {
        let numero = sessionStorage.getItem(this.CLE_NUMERO);
        if (!numero) {
            let compteur = parseInt(localStorage.getItem("wacdo_compteur") || "0", 10);
            compteur = compteur >= 999 ? 1 : compteur + 1;
            localStorage.setItem("wacdo_compteur", String(compteur));
            numero = String(compteur);
            sessionStorage.setItem(this.CLE_NUMERO, numero);
        }
        return numero;
    },

    setNumeroChevalet(numero) {
        sessionStorage.setItem(this.CLE_CHEVALET, numero);
    },

    getNumeroChevalet() {
        return sessionStorage.getItem(this.CLE_CHEVALET);
    },

    // Reinitialiser une commande (panier + num)
    reinitialiserCommande() {
        sessionStorage.removeItem(this.CLE_PANIER);
        sessionStorage.removeItem(this.CLE_NUMERO);
        sessionStorage.removeItem(this.CLE_CHEVALET);
        sessionStorage.removeItem(this.CLE_MODE);
    },

    // formate le nombre en prix affichable
    formaterPrix(nombre) {
        return nombre.toFixed(2).replace(".", ",") + " €";
    },

    // Construction du JSON de la commande final + redirection vers l'ecran de fin

    async envoyerCommande(numeroChevalet) {
        const commande = {
            numeroCommande: this.getNumeroCommande(),
            mode: this.getMode(),
            numeroChevalet: numeroChevalet,
            articles: this.getArticles(),
            total: this.getTotal(),
            date: new Date().toISOString(),
        };

        try {
            await fetch("https://api.wacdo-fictive.exemple/commandes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commande),
            });
        } catch (erreur) {
            console.warn("Envoi à l'api fictive impossible ( attendu en environnement de test) :", erreur);
        }

        sessionStorage.setItem("wacdo_derniere_commande", JSON.stringify(commande));
        window.location.href = "merci.html";
    },

};
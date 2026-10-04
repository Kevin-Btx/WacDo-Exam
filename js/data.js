const Donnees = {
    categories: null,
    produits: null,

    async chargerCategories() {
        if (this.categories) return this.categories;
        const reponse = await fetch ("data/categories.json");
        if (!reponse.ok) {
            throw new Error ("Impossible de charger les catégories (" + reponse.status + ")");
        }
        this.categories = await reponse.json();
        return this.categories;
    },

    async chargerProduits() {
        if (this.produits) return this.produits;
        const reponse = await fetch ("data/produits.json");
        if (!reponse.ok) {
            throw new Error("Impossible de charger les produits (" + reponse.status +")");
        }
        this.produits = await reponse.json();
        return this.produits;
    },

    async getProduitsParCategorie(cle) {
        const produits = await this.chargerProduits();
        return produits[cle] || [];
    },
};
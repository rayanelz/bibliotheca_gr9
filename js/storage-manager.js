/**
 * StorageManager - Gestion de la persistance des données avec LocalStorage
 */
class StorageManager {
    constructor() {
        this.keys = {
            books: 'bibliotheca_books',
            authors: 'bibliotheca_authors',
            settings: 'bibliotheca_settings'
        };
        this.initializeStorage();
    }

    /**
     * Initialise le storage avec des données par défaut si vide
     */
    initializeStorage() {
        const existingBooks = this.load(this.keys.books);
        const existingAuthors = this.load(this.keys.authors);

        const sampleBooks = this.getSampleBooks();
        const sampleAuthors = this.getSampleAuthors();

        if (!existingBooks || existingBooks.length === 0) {
            this.save(this.keys.books, sampleBooks);
        }

        if (!existingAuthors || existingAuthors.length === 0) {
            this.save(this.keys.authors, sampleAuthors);
        }
        if (!this.load(this.keys.settings)) {
            this.save(this.keys.settings, {
                theme: 'light',
                language: 'fr',
                itemsPerPage: 10
            });
        }
    }

    /**
     * Génère des données d'exemple pour les livres
     * @returns {Array} - Liste de livres d'exemple
     */
    getSampleBooks() {
        return window.SAMPLE_BOOKS || [
            {
                id: 1,
                title: "Le Petit Prince",
                author: "Antoine de Saint-Exupéry",
                isbn: "978-2-07-040809-8",
                genre: "Fiction",
                year: 1943,
                rating: 5,
                description: "Un conte poétique et philosophique sous l'apparence d'un conte pour enfants. L'histoire d'un petit prince qui voyage de planète en planète.",
                available: true,
                dateAdded: "2024-01-15",
                coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&crop=center"
            },
            {
                id: 2,
                title: "1984",
                author: "George Orwell",
                isbn: "978-0-452-28423-4",
                genre: "Science-Fiction",
                year: 1949,
                rating: 5,
                description: "Un roman dystopique qui dépeint une société totalitaire où la liberté de pensée est abolie. Une œuvre prophétique sur la surveillance de masse.",
                available: true,
                dateAdded: "2024-01-20",
                coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=center"
            }
        ];
    }

    /**
     * Génère des données d'exemple pour les auteurs
     * @returns {Array} - Liste d'auteurs d'exemple
     */
    getSampleAuthors() {
        return window.SAMPLE_AUTHORS || [
            {
                id: 1,
                name: "Antoine de Saint-Exupéry",
                nationality: "Française",
                birthDate: "1900-06-29T00:00:00.000Z",
                biography: "Écrivain, poète, aviateur et reporter français. Auteur du célèbre 'Petit Prince', il a marqué la littérature par ses récits inspirés de son expérience de pilote.",
                photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
                dateAdded: "2024-01-15T10:00:00.000Z"
            },
            {
                id: 2,
                name: "George Orwell",
                nationality: "Britannique",
                birthDate: "1903-06-25T00:00:00.000Z",
                biography: "Écrivain et journaliste britannique, célèbre pour ses romans dystopiques '1984' et 'La Ferme des animaux'. Critique féroce du totalitarisme.",
                photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
                dateAdded: "2024-01-16T10:00:00.000Z"
            }
        ];
    }

    /**
     * Sauvegarde des données dans LocalStorage
     * @param {string} key - Clé de stockage
     * @param {*} data - Données à sauvegarder
     * @returns {boolean} - Succès de l'opération
     */
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    /**
     * Chargement des données depuis LocalStorage
     * @param {string} key - Clé de stockage
     * @returns {*} - Données chargées ou null
     */
    load(key) {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return null;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return null;
        }
    }

    /**
     * Suppression d'une clé du storage
     * @param {string} key - Clé à supprimer
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            return false;
        }
    }

    /**
     * Nettoyage complet du storage
     */
    clear() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            this.initializeStorage();
            return true;
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
            return false;
        }
    }

    /**
     * Réinitialise les données avec les exemples
     */
    resetToSampleData() {
        try {
            this.save(this.keys.books, this.getSampleBooks());
            this.save(this.keys.authors, this.getSampleAuthors());
            return true;
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            return false;
        }
    }

    /**
     * Sauvegarde des livres
     * @param {Array} books - Liste des livres
     */
    saveBooks(books) {
        return this.save(this.keys.books, books);
    }

    /**
     * Chargement des livres
     * @returns {Array} - Liste des livres
     */
    loadBooks() {
        return this.load(this.keys.books) || [];
    }

    /**
     * Sauvegarde des auteurs
     * @param {Array} authors - Liste des auteurs
     */
    saveAuthors(authors) {
        return this.save(this.keys.authors, authors);
    }

    /**
     * Chargement des auteurs
     * @returns {Array} - Liste des auteurs
     */
    loadAuthors() {
        return this.load(this.keys.authors) || [];
    }

    /**
     * Validation des données avant sauvegarde
     * @param {*} data - Données à valider
     * @returns {boolean} - Validité des données
     */
    validateData(data) {
        if (data === null || data === undefined) {
            return false;
        }
        
        try {
            JSON.stringify(data);
            return true;
        } catch (error) {
            console.error('Données non sérialisables:', error);
            return false;
        }
    }

    /**
     * Gestion des erreurs de storage
     * @param {Error} error - Erreur rencontrée
     */
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            console.warn('Quota de stockage dépassé');
            this.showStorageQuotaWarning();
        } else {
            console.error('Erreur de stockage:', error);
        }
    }

    /**
     * Affichage d'un avertissement de quota dépassé
     */
    showStorageQuotaWarning() {
        if (window.showToast) {
            window.showToast('Espace de stockage insuffisant. Certaines données peuvent ne pas être sauvegardées.', 'warning');
        }
    }

    /**
     * Obtention de la taille utilisée du storage
     * @returns {number} - Taille en octets
     */
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * Vérification de la disponibilité du LocalStorage
     * @returns {boolean} - Disponibilité
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Export des données pour sauvegarde
     * @returns {Object} - Toutes les données
     */
    exportData() {
        return {
            books: this.loadBooks(),
            authors: this.loadAuthors(),
            settings: this.load(this.keys.settings),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import des données depuis une sauvegarde
     * @param {Object} data - Données à importer
     * @returns {boolean} - Succès de l'import
     */
    importData(data) {
        try {
            if (data.books && Array.isArray(data.books)) {
                this.saveBooks(data.books);
            }
            if (data.authors && Array.isArray(data.authors)) {
                this.saveAuthors(data.authors);
            }
            if (data.settings && typeof data.settings === 'object') {
                this.save(this.keys.settings, data.settings);
            }
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            return false;
        }
    }
}
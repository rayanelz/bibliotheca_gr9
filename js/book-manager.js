/**
 * BookManager - Gestionnaire des livres avec CRUD complet
 */
class BookManager {
    constructor(storageManager, apiClient) {
        this.storageManager = storageManager;
        this.apiClient = apiClient;
        this.books = [];
        this.currentEditId = null;
        this.searchTerm = '';
        this.searchMode = 'local'; // local | api
        this.sortCriteria = 'title';
        this.sortOrder = 'asc';
        this.apiResults = [];
        
        this.loadBooks();
        this.setupEventListeners();
    }

    /**
     * Génération d'un UUID simple
     * @returns {string} - UUID
     */
    generateId() {
        return 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Chargement des livres depuis le storage
     */
    loadBooks() {
        this.books = this.storageManager.loadBooks();
        this.renderBooksList();
    }

    /**
     * Sauvegarde des livres dans le storage
     */
    saveBooks() {
        this.storageManager.saveBooks(this.books);
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Bouton d'ajout de livre
        const addBookBtn = document.getElementById('add-book-btn');
        if (addBookBtn) {
            addBookBtn.addEventListener('click', () => this.showBookModal());
        }

        // Bouton de sauvegarde dans le modal
        const saveBookBtn = document.getElementById('saveBookBtn');
        if (saveBookBtn) {
            saveBookBtn.addEventListener('click', () => this.saveBook());
        }

        // Recherche
        const searchInput = document.getElementById('book-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (this.searchMode === 'local') {
                    this.searchTerm = e.target.value;
                    this.renderBooksList();
                }
            });

            // Permettre la touche Entrée pour lancer la recherche API
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch();
                }
            });
        }

        // Tri
        const sortSelect = document.getElementById('sort-books');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortCriteria = e.target.value;
                this.renderBooksList();
            });
        }

        // Bouton de recherche
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        // Modes de recherche (Local vs OpenLibrary)
        const modeLocalBtn = document.getElementById('search-mode-local');
        const modeAPIBtn = document.getElementById('search-mode-api');
        if (modeLocalBtn && modeAPIBtn) {
            modeLocalBtn.addEventListener('click', () => this.setSearchMode('local'));
            modeAPIBtn.addEventListener('click', () => this.setSearchMode('api'));
        }

        // Validation en temps réel
        this.setupFormValidation();
    }

    /**
     * Configuration de la validation des formulaires
     */
    setupFormValidation() {
        const form = document.getElementById('bookForm');
        if (!form) return;

        const fields = ['bookTitle', 'bookAuthor', 'bookISBN', 'bookGenre', 'bookYear'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.validateField(fieldId));
                field.addEventListener('blur', () => this.validateField(fieldId));
            }
        });
    }

    /**
     * Validation d'un champ spécifique
     * @param {string} fieldId - ID du champ à valider
     */
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldId) {
            case 'bookTitle':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Le titre est requis';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Le titre doit contenir au moins 2 caractères';
                }
                break;

            case 'bookAuthor':
                if (!value) {
                    isValid = false;
                    errorMessage = 'L\'auteur est requis';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Le nom de l\'auteur doit contenir au moins 2 caractères';
                }
                break;

            case 'bookISBN':
                if (value && !this.validateISBN(value)) {
                    isValid = false;
                    errorMessage = 'Format ISBN invalide (ISBN-10 ou ISBN-13)';
                }
                break;

            case 'bookGenre':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Le genre est requis';
                }
                break;

            case 'bookYear':
                const year = parseInt(value);
                const currentYear = new Date().getFullYear();
                if (!value) {
                    isValid = false;
                    errorMessage = 'L\'année de publication est requise';
                } else if (isNaN(year) || year < 1000 || year > currentYear + 1) {
                    isValid = false;
                    errorMessage = `L'année doit être entre 1000 et ${currentYear + 1}`;
                }
                break;
        }

        this.updateFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    /**
     * Mise à jour de l'affichage de validation d'un champ
     * @param {HTMLElement} field - Champ à mettre à jour
     * @param {boolean} isValid - Validité du champ
     * @param {string} errorMessage - Message d'erreur
     */
    updateFieldValidation(field, isValid, errorMessage) {
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            if (feedback) feedback.textContent = '';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            if (feedback) feedback.textContent = errorMessage;
        }
    }

    /**
     * Validation du format ISBN
     * @param {string} isbn - ISBN à valider
     * @returns {boolean} - Validité de l'ISBN
     */
    validateISBN(isbn) {
        // Suppression des tirets et espaces
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        
        // Vérification ISBN-10
        if (cleanISBN.length === 10) {
            return this.validateISBN10(cleanISBN);
        }
        
        // Vérification ISBN-13
        if (cleanISBN.length === 13) {
            return this.validateISBN13(cleanISBN);
        }
        
        return false;
    }

    /**
     * Validation ISBN-10
     * @param {string} isbn - ISBN-10 à valider
     * @returns {boolean} - Validité
     */
    validateISBN10(isbn) {
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            if (!/\d/.test(isbn[i])) return false;
            sum += parseInt(isbn[i]) * (10 - i);
        }
        
        const checkDigit = isbn[9];
        if (checkDigit === 'X') {
            sum += 10;
        } else if (/\d/.test(checkDigit)) {
            sum += parseInt(checkDigit);
        } else {
            return false;
        }
        
        return sum % 11 === 0;
    }

    /**
     * Validation ISBN-13
     * @param {string} isbn - ISBN-13 à valider
     * @returns {boolean} - Validité
     */
    validateISBN13(isbn) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            if (!/\d/.test(isbn[i])) return false;
            sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
        }
        
        const checkDigit = parseInt(isbn[12]);
        if (isNaN(checkDigit)) return false;
        
        return (10 - (sum % 10)) % 10 === checkDigit;
    }

    /**
     * Validation complète du formulaire
     * @returns {boolean} - Validité du formulaire
     */
    validateForm() {
        const fields = ['bookTitle', 'bookAuthor', 'bookGenre', 'bookYear'];
        let isFormValid = true;

        fields.forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isFormValid = false;
            }
        });

        // Validation optionnelle de l'ISBN
        const isbnField = document.getElementById('bookISBN');
        if (isbnField && isbnField.value.trim()) {
            if (!this.validateField('bookISBN')) {
                isFormValid = false;
            }
        }

        return isFormValid;
    }

    /**
     * Affichage du modal de livre
     * @param {string} bookId - ID du livre à éditer (optionnel)
     */
    showBookModal(bookId = null) {
        const modal = new bootstrap.Modal(document.getElementById('bookModal'));
        const modalTitle = document.getElementById('bookModalTitle');
        const form = document.getElementById('bookForm');

        this.currentEditId = bookId;
        console.log('showBookModal appelé avec bookId:', bookId);
        console.log('Books disponibles:', this.books.map(b => b.id));

        if (bookId) {
            // Mode édition
            modalTitle.textContent = 'Modifier le Livre';
            const book = this.books.find(b => b.id == bookId); // Utiliser == pour être flexible
            console.log('Livre trouvé:', book);
            if (book) {
                this.populateForm(book);
            } else {
                console.warn('Livre non trouvé avec l\'ID:', bookId);
            }
        } else {
            // Mode création
            modalTitle.textContent = 'Ajouter un Livre';
            form.reset();
            this.clearFormValidation();
        }

        modal.show();
    }

    /**
     * Remplissage du formulaire avec les données d'un livre
     * @param {Object} book - Livre à éditer
     */
    populateForm(book) {
        document.getElementById('bookTitle').value = book.title || '';
        document.getElementById('bookAuthor').value = book.author || '';
        document.getElementById('bookISBN').value = book.isbn || '';
        document.getElementById('bookGenre').value = book.genre || '';
        document.getElementById('bookYear').value = book.year || '';
        document.getElementById('bookRating').value = book.rating ? book.rating.toString() : '';
        document.getElementById('bookDescription').value = book.description || '';
        document.getElementById('bookAvailable').checked = book.available !== false;
    }

    /**
     * Nettoyage de la validation du formulaire
     */
    clearFormValidation() {
        const form = document.getElementById('bookForm');
        const fields = form.querySelectorAll('.form-control, .form-select');
        
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
    }

    /**
     * Sauvegarde d'un livre
     */
    async saveBook() {
        if (!this.validateForm()) {
            this.showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
            return;
        }

        const bookData = this.getFormData();
        
        // Validation des données avant sauvegarde
        if (!bookData || typeof bookData !== 'object') {
            console.error('Données invalides:', bookData);
            this.showToast('Données du formulaire invalides', 'error');
            return;
        }

        // Vérifier qu'il n'y a pas de NaN ou d'undefined dans les données critiques
        if (isNaN(bookData.year) || bookData.year === undefined) {
            console.error('Année invalide:', bookData.year);
            bookData.year = new Date().getFullYear();
        }

        try {
            console.log('Tentative de sauvegarde, données:', bookData);
            
            if (this.currentEditId) {
                // Mise à jour
                console.log('Mode édition, ID:', this.currentEditId);
                await this.updateBook(this.currentEditId, bookData);
                this.showToast('Livre modifié avec succès', 'success');
            } else {
                // Création
                console.log('Mode création');
                await this.createBook(bookData);
                this.showToast('Livre ajouté avec succès', 'success');
            }

            // Fermeture du modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookModal'));
            modal.hide();

            // Rafraîchissement de la liste
            this.renderBooksList();
            
            // Mise à jour du dashboard
            if (window.dashboardManager) {
                window.dashboardManager.updateDashboard();
            }

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            console.error('Stack:', error.stack);
            this.showToast('Erreur lors de la sauvegarde: ' + error.message, 'error');
        }
    }

    /**
     * Récupération des données du formulaire
     * @returns {Object} - Données du livre
     */
    getFormData() {
        const ratingValue = document.getElementById('bookRating').value;
        const yearValue = document.getElementById('bookYear').value;
        
        return {
            title: document.getElementById('bookTitle').value.trim(),
            author: document.getElementById('bookAuthor').value.trim(),
            isbn: document.getElementById('bookISBN').value.trim(),
            genre: document.getElementById('bookGenre').value,
            year: yearValue ? parseInt(yearValue) : new Date().getFullYear(),
            rating: ratingValue && ratingValue.trim() ? parseInt(ratingValue) : null,
            description: document.getElementById('bookDescription').value.trim(),
            available: document.getElementById('bookAvailable').checked
        };
    }

    /**
     * Création d'un nouveau livre
     * @param {Object} bookData - Données du livre
     * @returns {Object} - Livre créé
     */
    async createBook(bookData) {
        const book = {
            id: this.generateId(),
            ...bookData,
            dateAdded: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // Tentative d'enrichissement avec l'API
        try {
            if (book.isbn && this.apiClient) {
                const apiData = await this.apiClient.getBookDetails(book.isbn);
                book.enrichedData = apiData;
                book.coverUrl = apiData.coverUrl;
            }
        } catch (error) {
            console.log('Enrichissement API échoué:', error.message);
        }

        this.books.push(book);
        this.saveBooks();
        return book;
    }

    /**
     * Mise à jour d'un livre existant
     * @param {string} id - ID du livre
     * @param {Object} bookData - Nouvelles données
     * @returns {Object} - Livre mis à jour
     */
    async updateBook(id, bookData) {
        console.log('updateBook appelé avec ID:', id);
        console.log('Books dans updateBook:', this.books.map(b => b.id));
        
        const index = this.books.findIndex(book => book.id == id); // Utiliser == pour être flexible
        console.log('Index trouvé:', index);
        
        if (index === -1) {
            throw new Error('Livre non trouvé (ID: ' + id + ')');
        }

        const existingBook = this.books[index];
        const updatedBook = {
            ...existingBook,
            ...bookData,
            lastModified: new Date().toISOString()
        };

        // Tentative d'enrichissement si l'ISBN a changé
        if (bookData.isbn && bookData.isbn !== existingBook.isbn && this.apiClient) {
            try {
                const apiData = await this.apiClient.getBookDetails(bookData.isbn);
                updatedBook.enrichedData = apiData;
                updatedBook.coverUrl = apiData.coverUrl;
            } catch (error) {
                console.log('Enrichissement API échoué:', error.message);
            }
        }

        this.books[index] = updatedBook;
        this.saveBooks();
        return updatedBook;
    }

    /**
     * Suppression d'un livre
     * @param {string} id - ID du livre à supprimer
     */
    deleteBook(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        // Confirmation de suppression
        if (confirm(`Êtes-vous sûr de vouloir supprimer le livre "${book.title}" ?`)) {
            this.books = this.books.filter(b => b.id !== id);
            this.saveBooks();
            this.renderBooksList();
            
            // Mise à jour du dashboard
            if (window.dashboardManager) {
                window.dashboardManager.updateDashboard();
            }
            
            this.showToast('Livre supprimé avec succès', 'success');
        }
    }

    /**
     * Recherche de livres
     * @param {string} keyword - Mot-clé de recherche
     * @returns {Array} - Livres correspondants
     */
    searchBooks(keyword) {
        if (!keyword) return this.books;

        const searchTerm = keyword.toLowerCase();
        return this.books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.genre.toLowerCase().includes(searchTerm) ||
            (book.isbn && book.isbn.toLowerCase().includes(searchTerm)) ||
            (book.description && book.description.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Gestion du mode de recherche (local vs OpenLibrary)
     * @param {string} mode - 'local' ou 'api'
     */
    setSearchMode(mode) {
        if (mode !== 'local' && mode !== 'api') return;
        this.searchMode = mode;

        const localBtn = document.getElementById('search-mode-local');
        const apiBtn = document.getElementById('search-mode-api');
        const hint = document.getElementById('search-mode-hint');

        if (localBtn && apiBtn) {
            localBtn.classList.toggle('active', mode === 'local');
            apiBtn.classList.toggle('active', mode === 'api');
        }

        if (hint) {
            hint.textContent = mode === 'local' 
                ? 'Recherche locale (bibliothèque enregistrée)' 
                : 'Recherche via OpenLibrary (résultats distants, non enregistrés)';
        }

        // Mise à jour de l'affichage selon le mode
        if (mode === 'local') {
            const searchInput = document.getElementById('book-search');
            this.searchTerm = searchInput ? searchInput.value.trim() : '';
            this.renderBooksList();
        } else {
            this.apiResults = [];
            this.renderAPIResults();
        }
    }

    /**
     * Déclenchement de la recherche selon le mode sélectionné
     */
    handleSearch() {
        const searchInput = document.getElementById('book-search');
        const term = searchInput ? searchInput.value.trim() : '';

        if (this.searchMode === 'local') {
            this.searchTerm = term;
            this.renderBooksList();
            return;
        }

        this.searchRemoteBooks(term);
    }

    /**
     * Recherche de livres via l'API OpenLibrary
     * @param {string} term - Terme de recherche
     */
    async searchRemoteBooks(term) {
        const container = document.getElementById('books-list');
        if (!container) return;

        if (!this.apiClient) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-plug fa-2x mb-2"></i>
                    <p>Client API non disponible.</p>
                </div>
            `;
            return;
        }

        if (!term || term.length < 3) {
            this.apiResults = [];
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>Saisissez au moins 3 caractères pour rechercher dans OpenLibrary.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
                <p>Recherche dans OpenLibrary...</p>
            </div>
        `;

        try {
            const results = await this.apiClient.searchBooksByTitle(term, 12);
            this.apiResults = results;
            this.renderAPIResults();
        } catch (error) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                    <p>Erreur lors de la recherche API : ${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Rendu des résultats OpenLibrary
     */
    renderAPIResults() {
        const container = document.getElementById('books-list');
        if (!container) return;

        if (!this.apiResults || this.apiResults.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>Aucun résultat OpenLibrary pour cette recherche.</p>
                </div>
            `;
            return;
        }

        const resultsHTML = this.apiResults
            .map((result, index) => this.renderAPIResultCard(result, index))
            .join('');

        container.innerHTML = `<div class="row">${resultsHTML}</div>`;
        this.attachAPIResultEventListeners();
    }

    /**
     * Rendu d'une carte résultat OpenLibrary
     * @param {Object} result - Données OpenLibrary
     * @param {number} index - Index dans la liste
     * @returns {string} - HTML
     */
    renderAPIResultCard(result, index) {
        // Use the exact OpenLibrary cover URL, no fallback to random images
        const coverUrl = result.coverUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTNmMmZkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzE5NzZkMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9wZW5MaWJyYXJ5PC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMxOTc2ZDIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QYXMgZGUgY291dmVydHVyZTwvdGV4dD48L3N2Zz4=';
        const authors = result.authors && result.authors.length > 0 ? result.authors.join(', ') : 'Auteur inconnu';
        const subjects = result.subjects && result.subjects.length > 0 ? result.subjects.slice(0, 3).join(', ') : 'Sujet inconnu';
        const year = result.publishYear || 'Année inconnue';

        // Debug: Log API result card data
        console.log(`Rendering API result card for "${result.title}":`, {
            originalCoverUrl: result.coverUrl,
            finalCoverUrl: coverUrl,
            authors: result.authors,
            subjects: result.subjects
        });

        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card book-card h-100 border-info">
                    <div class="row g-0 h-100">
                        <div class="col-4">
                            <img src="${coverUrl}" class="img-fluid rounded-start h-100" 
                                 style="object-fit: cover;" alt="Couverture de ${result.title}"
                                 onerror="console.log('API cover failed to load:', '${coverUrl}'); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlYmVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2M2MjgyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycmV1cjwvdGV4dD48L3N2Zz4=';">
                        </div>
                        <div class="col-8">
                            <div class="card-body d-flex flex-column h-100">
                                <h6 class="card-title">${result.title}</h6>
                                <p class="card-text text-muted small mb-1">
                                    <i class="fas fa-user"></i> ${authors}
                                </p>
                                <p class="card-text text-muted small mb-1">
                                    <i class="fas fa-calendar"></i> ${year}
                                </p>
                                <p class="card-text text-muted small mb-2">
                                    <i class="fas fa-tags"></i> ${subjects}
                                </p>
                                ${result.isbn ? `
                                    <p class="card-text text-muted small mb-2">
                                        <i class="fas fa-barcode"></i> ${result.isbn}
                                    </p>
                                ` : ''}
                                <div class="mt-auto d-flex justify-content-between align-items-center">
                                    <span class="badge bg-info text-dark">OpenLibrary</span>
                                    <button class="btn btn-sm btn-success api-import-btn" data-api-index="${index}">
                                        <i class="fas fa-cloud-arrow-down"></i> Importer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attache les events sur les résultats OpenLibrary
     */
    attachAPIResultEventListeners() {
        document.querySelectorAll('.api-import-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('data-api-index'), 10);
                await this.importAPIResult(index);
            });
        });
    }

    /**
     * Import d'un résultat OpenLibrary dans la bibliothèque locale
     * @param {number} index - Index du résultat
     */
    async importAPIResult(index) {
        const result = this.apiResults[index];
        if (!result) return;

        // Debug: Log the result data to see what we're working with
        console.log('Importing OpenLibrary result:', result);
        console.log('Cover URL from API:', result.coverUrl);

        const bookData = {
            title: result.title || 'Titre inconnu',
            author: (result.authors && result.authors.length > 0) ? result.authors[0] : 'Auteur inconnu',
            isbn: result.isbn || '',
            genre: (result.subjects && result.subjects.length > 0) ? result.subjects[0] : 'Non classé',
            year: result.publishYear || new Date().getFullYear(),
            rating: null,
            description: '',
            available: true,
            coverUrl: result.coverUrl, // Keep the exact OpenLibrary cover URL (can be null)
            apiSubjects: result.subjects || [],
            enrichedFromAPI: true
        };

        // Debug: Log the book data being created
        console.log('Book data being created:', bookData);
        console.log('Cover URL being saved:', bookData.coverUrl);

        try {
            await this.createBook(bookData);
            if (this.searchMode === 'local') {
                this.renderBooksList();
            } else {
                this.renderAPIResults();
            }

            if (window.dashboardManager) {
                window.dashboardManager.updateDashboard();
            }

            this.showToast('Livre importé depuis OpenLibrary', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'import OpenLibrary:', error);
            this.showToast('Échec de l\'import depuis OpenLibrary', 'error');
        }
    }

    /**
     * Tri des livres
     * @param {Array} books - Livres à trier
     * @param {string} criteria - Critère de tri
     * @param {string} order - Ordre (asc/desc)
     * @returns {Array} - Livres triés
     */
    sortBooks(books, criteria, order = 'asc') {
        return books.sort((a, b) => {
            let valueA, valueB;

            switch (criteria) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'author':
                    valueA = a.author.toLowerCase();
                    valueB = b.author.toLowerCase();
                    break;
                case 'year':
                    valueA = a.publishYear || 0;
                    valueB = b.publishYear || 0;
                    break;
                case 'genre':
                    valueA = a.genre.toLowerCase();
                    valueB = b.genre.toLowerCase();
                    break;
                default:
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
            }

            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Rendu de la liste des livres
     */
    renderBooksList() {
        const container = document.getElementById('books-list');
        if (!container) return;

        // Filtrage et tri
        let filteredBooks = this.searchBooks(this.searchTerm);
        filteredBooks = this.sortBooks(filteredBooks, this.sortCriteria, this.sortOrder);

        if (filteredBooks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-book fa-3x text-muted mb-3"></i>
                    <p class="text-muted">
                        ${this.searchTerm ? 'Aucun livre trouvé pour cette recherche' : 'Aucun livre trouvé. Ajoutez votre premier livre !'}
                    </p>
                </div>
            `;
            return;
        }

        const booksHTML = filteredBooks.map(book => this.renderBookCard(book)).join('');
        container.innerHTML = `<div class="row">${booksHTML}</div>`;
        
        // Ajout des event listeners après le rendu
        this.attachBookCardEventListeners();
    }

    /**
     * Attache les event listeners aux boutons des cartes de livres
     */
    attachBookCardEventListeners() {
        // Boutons de détails (œil)
        document.querySelectorAll('.book-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookId = btn.getAttribute('data-book-id');
                console.log('Clic sur détails, ID:', bookId);
                this.showBookDetails(bookId);
            });
        });

        // Boutons d'édition
        document.querySelectorAll('.book-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookId = btn.getAttribute('data-book-id');
                this.showBookModal(bookId);
            });
        });

        // Boutons de suppression
        document.querySelectorAll('.book-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookId = btn.getAttribute('data-book-id');
                this.deleteBook(bookId);
            });
        });
    }

    /**
     * Rendu d'une carte de livre
     * @param {Object} book - Livre à afficher
     * @returns {string} - HTML de la carte
     */
    renderBookCard(book) {
        const rating = book.rating ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : '';
        
        // Use the exact OpenLibrary cover URL if available, otherwise use a simple data URI placeholder
        const coverUrl = book.coverUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdnJlPC90ZXh0Pjwvc3ZnPg==';
        
        // Debug: Log cover URL being used
        console.log(`Rendering book "${book.title}" with cover URL:`, coverUrl);
        console.log('Book object:', book);
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card book-card h-100">
                    <div class="row g-0 h-100">
                        <div class="col-4">
                            <img src="${coverUrl}" class="img-fluid rounded-start h-100" 
                                 style="object-fit: cover;" alt="Couverture de ${book.title}"
                                 onerror="console.log('Cover failed to load:', '${coverUrl}'); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycmV1cjwvdGV4dD48L3N2Zz4=';">
                        </div>
                        <div class="col-8">
                            <div class="card-body d-flex flex-column h-100">
                                <h6 class="card-title">${book.title}</h6>
                                <p class="card-text text-muted small mb-1">
                                    <i class="fas fa-user"></i> ${book.author}
                                </p>
                                <p class="card-text text-muted small mb-1">
                                    <i class="fas fa-tag"></i> ${book.genre}
                                </p>
                                ${book.year ? `
                                    <p class="card-text text-muted small mb-1">
                                        <i class="fas fa-calendar"></i> ${book.year}
                                    </p>
                                ` : ''}
                                ${rating ? `
                                    <p class="card-text book-rating small mb-2">${rating}</p>
                                ` : ''}
                                <div class="mt-auto">
                                    <span class="badge ${book.available ? 'bg-success' : 'bg-warning'}">
                                        ${book.available ? 'Disponible' : 'Indisponible'}
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-outline-primary me-1 book-details-btn" 
                                            data-book-id="${book.id}">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary me-1 book-edit-btn" 
                                            data-book-id="${book.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger book-delete-btn" 
                                            data-book-id="${book.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Affichage des détails d'un livre
     * @param {string} id - ID du livre
     */
    showBookDetails(id) {
        console.log('showBookDetails appelé avec ID:', id);
        
        const book = this.books.find(b => b.id == id); // Utilisation de == pour être plus flexible
        if (!book) {
            console.error('Livre non trouvé:', id);
            console.log('Livres disponibles:', this.books.map(b => ({id: b.id, title: b.title})));
            alert('Livre non trouvé !');
            return;
        }

        console.log('Livre trouvé:', book);

        const rating = book.rating ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : 'Pas de note';
        
        // Use the exact cover URL from the book, no random fallbacks
        const coverUrl = book.coverUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzc1NzU3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdnJlPC90ZXh0Pjwvc3ZnPg==';

        // Suppression de l'ancien modal s'il existe
        const existingModal = document.getElementById('bookDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        const detailsHTML = `
            <div class="modal fade" id="bookDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${book.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <img src="${coverUrl}" class="img-fluid rounded" alt="Couverture" 
                                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzc1NzU3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdnJlPC90ZXh0Pjwvc3ZnPg==';">
                                </div>
                                <div class="col-md-8">
                                    <table class="table table-borderless">
                                        <tr><td><strong>Auteur:</strong></td><td>${book.author}</td></tr>
                                        <tr><td><strong>Genre:</strong></td><td>${book.genre}</td></tr>
                                        ${book.year ? `<tr><td><strong>Année:</strong></td><td>${book.year}</td></tr>` : ''}
                                        ${book.isbn ? `<tr><td><strong>ISBN:</strong></td><td>${book.isbn}</td></tr>` : ''}
                                        <tr><td><strong>Note:</strong></td><td>${rating}</td></tr>
                                        <tr><td><strong>Statut:</strong></td><td>
                                            <span class="badge ${book.available ? 'bg-success' : 'bg-warning'}">
                                                ${book.available ? 'Disponible' : 'Indisponible'}
                                            </span>
                                        </td></tr>
                                        <tr><td><strong>Ajouté le:</strong></td><td>${new Date(book.dateAdded).toLocaleDateString()}</td></tr>
                                    </table>
                                    ${book.description ? `
                                        <div class="mt-3">
                                            <strong>Description:</strong>
                                            <p class="mt-2">${book.description}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                            <button type="button" class="btn btn-primary" onclick="bookManager.showBookModal('${book.id}')" data-bs-dismiss="modal">
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ajout du nouveau modal
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
        
        // Affichage du modal
        try {
            console.log('Tentative d\'ouverture du modal...');
            const modalElement = document.getElementById('bookDetailsModal');
            console.log('Élément modal trouvé:', !!modalElement);
            console.log('Bootstrap disponible:', typeof bootstrap !== 'undefined');
            
            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                console.log('Modal ouvert avec succès');
            } else {
                console.error('Bootstrap non disponible');
                alert('Erreur: Bootstrap non chargé');
            }
        } catch (error) {
            console.error('Erreur lors de l\'affichage du modal:', error);
            alert('Erreur lors de l\'affichage des détails: ' + error.message);
        }
    }

    /**
     * Affichage d'un toast de notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de toast (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        // Implémentation simple avec alert pour le moment
        // Dans une vraie application, on utiliserait une librairie de toast
        if (type === 'error') {
            alert('Erreur: ' + message);
        } else {
            alert(message);
        }
    }

    /**
     * Obtention de tous les livres
     * @returns {Array} - Liste des livres
     */
    getAllBooks() {
        return [...this.books];
    }

    /**
     * Obtention d'un livre par ID
     * @param {string} id - ID du livre
     * @returns {Object|null} - Livre trouvé ou null
     */
    getBookById(id) {
        return this.books.find(book => book.id === id) || null;
    }

    /**
     * Obtention des statistiques des livres
     * @returns {Object} - Statistiques
     */
    getBookStats() {
        const stats = {
            total: this.books.length,
            available: this.books.filter(b => b.available === true).length,
            genres: {},
            authors: {},
            years: {}
        };

        this.books.forEach(book => {
            // Comptage par genre
            stats.genres[book.genre] = (stats.genres[book.genre] || 0) + 1;
            
            // Comptage par auteur
            stats.authors[book.author] = (stats.authors[book.author] || 0) + 1;
            
            // Comptage par année
            if (book.year) {
                stats.years[book.year] = (stats.years[book.year] || 0) + 1;
            }
        });

        return stats;
    }
}
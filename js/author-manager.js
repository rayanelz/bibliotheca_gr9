/**
 * AuthorManager - Gestionnaire des auteurs avec CRUD simplifié
 */
class AuthorManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.authors = [];
        this.currentEditId = null;
        
        this.loadAuthors();
        this.setupEventListeners();
    }

    /**
     * Génération d'un UUID simple
     * @returns {string} - UUID
     */
    generateId() {
        return 'author_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Chargement des auteurs depuis le storage
     */
    loadAuthors() {
        this.authors = this.storageManager.loadAuthors();
        this.renderAuthorsList();
    }

    /**
     * Sauvegarde des auteurs dans le storage
     */
    saveAuthors() {
        this.storageManager.saveAuthors(this.authors);
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Bouton d'ajout d'auteur
        const addAuthorBtn = document.getElementById('add-author-btn');
        if (addAuthorBtn) {
            addAuthorBtn.addEventListener('click', () => this.showAuthorModal());
        }

        // Bouton de sauvegarde dans le modal
        const saveAuthorBtn = document.getElementById('saveAuthorBtn');
        if (saveAuthorBtn) {
            saveAuthorBtn.addEventListener('click', () => this.saveAuthor());
        }

        // Validation en temps réel
        this.setupFormValidation();
    }

    /**
     * Configuration de la validation des formulaires
     */
    setupFormValidation() {
        const nameField = document.getElementById('authorName');
        if (nameField) {
            nameField.addEventListener('input', () => this.validateField('authorName'));
            nameField.addEventListener('blur', () => this.validateField('authorName'));
        }

        const birthDateField = document.getElementById('authorBirthDate');
        if (birthDateField) {
            birthDateField.addEventListener('input', () => this.validateField('authorBirthDate'));
        }
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
            case 'authorName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Le nom de l\'auteur est requis';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Le nom doit contenir au moins 2 caractères';
                }
                break;

            case 'authorBirthDate':
                if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const maxDate = new Date();
                    maxDate.setFullYear(maxDate.getFullYear() - 10); // Au moins 10 ans

                    if (birthDate > today) {
                        isValid = false;
                        errorMessage = 'La date de naissance ne peut pas être dans le futur';
                    } else if (birthDate > maxDate) {
                        isValid = false;
                        errorMessage = 'L\'auteur doit avoir au moins 10 ans';
                    }
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
     * Validation complète du formulaire
     * @returns {boolean} - Validité du formulaire
     */
    validateForm() {
        const nameValid = this.validateField('authorName');
        const birthDateValid = this.validateField('authorBirthDate');
        
        return nameValid && birthDateValid;
    }

    /**
     * Affichage du modal d'auteur
     * @param {string} authorId - ID de l'auteur à éditer (optionnel)
     */
    showAuthorModal(authorId = null) {
        const modal = new bootstrap.Modal(document.getElementById('authorModal'));
        const modalTitle = document.getElementById('authorModalTitle');
        const form = document.getElementById('authorForm');

        this.currentEditId = authorId;

        if (authorId) {
            // Mode édition
            modalTitle.textContent = 'Modifier l\'Auteur';
            const author = this.authors.find(a => a.id === authorId);
            if (author) {
                this.populateForm(author);
            }
        } else {
            // Mode création
            modalTitle.textContent = 'Ajouter un Auteur';
            form.reset();
            this.clearFormValidation();
        }

        modal.show();
    }

    /**
     * Remplissage du formulaire avec les données d'un auteur
     * @param {Object} author - Auteur à éditer
     */
    populateForm(author) {
        document.getElementById('authorName').value = author.name || '';
        document.getElementById('authorNationality').value = author.nationality || '';
        document.getElementById('authorBirthDate').value = author.birthDate ? 
            author.birthDate.split('T')[0] : '';
        document.getElementById('authorBiography').value = author.biography || '';
    }

    /**
     * Nettoyage de la validation du formulaire
     */
    clearFormValidation() {
        const form = document.getElementById('authorForm');
        const fields = form.querySelectorAll('.form-control');
        
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
    }

    /**
     * Sauvegarde d'un auteur
     */
    async saveAuthor() {
        if (!this.validateForm()) {
            this.showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
            return;
        }

        const authorData = this.getFormData();
        
        try {
            if (this.currentEditId) {
                // Mise à jour
                await this.updateAuthor(this.currentEditId, authorData);
                this.showToast('Auteur modifié avec succès', 'success');
            } else {
                // Création
                await this.createAuthor(authorData);
                this.showToast('Auteur ajouté avec succès', 'success');
            }

            // Fermeture du modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('authorModal'));
            modal.hide();

            // Rafraîchissement de la liste
            this.renderAuthorsList();
            
            // Mise à jour du dashboard
            if (window.dashboardManager) {
                window.dashboardManager.updateDashboard();
            }

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    /**
     * Récupération des données du formulaire
     * @returns {Object} - Données de l'auteur
     */
    getFormData() {
        const birthDate = document.getElementById('authorBirthDate').value;
        
        return {
            name: document.getElementById('authorName').value.trim(),
            nationality: document.getElementById('authorNationality').value.trim(),
            birthDate: birthDate ? new Date(birthDate).toISOString() : null,
            biography: document.getElementById('authorBiography').value.trim()
        };
    }

    /**
     * Création d'un nouvel auteur
     * @param {Object} authorData - Données de l'auteur
     * @returns {Object} - Auteur créé
     */
    async createAuthor(authorData) {
        const author = {
            id: this.generateId(),
            ...authorData,
            dateAdded: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            bookCount: 0 // Sera calculé dynamiquement
        };

        this.authors.push(author);
        this.saveAuthors();
        return author;
    }

    /**
     * Mise à jour d'un auteur existant
     * @param {string} id - ID de l'auteur
     * @param {Object} authorData - Nouvelles données
     * @returns {Object} - Auteur mis à jour
     */
    async updateAuthor(id, authorData) {
        const index = this.authors.findIndex(author => author.id === id);
        if (index === -1) {
            throw new Error('Auteur non trouvé');
        }

        const existingAuthor = this.authors[index];
        const updatedAuthor = {
            ...existingAuthor,
            ...authorData,
            lastModified: new Date().toISOString()
        };

        this.authors[index] = updatedAuthor;
        this.saveAuthors();
        return updatedAuthor;
    }

    /**
     * Suppression d'un auteur
     * @param {string} id - ID de l'auteur à supprimer
     */
    deleteAuthor(id) {
        const author = this.authors.find(a => a.id === id);
        if (!author) return;

        // Vérification s'il y a des livres associés
        const bookCount = this.getAuthorBookCount(author.name);
        let confirmMessage = `Êtes-vous sûr de vouloir supprimer l'auteur "${author.name}" ?`;
        
        if (bookCount > 0) {
            confirmMessage += `\n\nAttention: ${bookCount} livre(s) sont associés à cet auteur.`;
        }

        // Confirmation de suppression
        if (confirm(confirmMessage)) {
            this.authors = this.authors.filter(a => a.id !== id);
            this.saveAuthors();
            this.renderAuthorsList();
            
            // Mise à jour du dashboard
            if (window.dashboardManager) {
                window.dashboardManager.updateDashboard();
            }
            
            this.showToast('Auteur supprimé avec succès', 'success');
        }
    }

    /**
     * Obtention du nombre de livres d'un auteur
     * @param {string} authorName - Nom de l'auteur
     * @returns {number} - Nombre de livres
     */
    getAuthorBookCount(authorName) {
        if (window.bookManager) {
            const books = window.bookManager.getAllBooks();
            return books.filter(book => 
                book.author.toLowerCase() === authorName.toLowerCase()
            ).length;
        }
        return 0;
    }

    /**
     * Rendu de la liste des auteurs
     */
    renderAuthorsList() {
        const container = document.getElementById('authors-list');
        if (!container) return;

        if (this.authors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-user-edit fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Aucun auteur trouvé. Ajoutez votre premier auteur !</p>
                </div>
            `;
            return;
        }

        const authorsHTML = this.authors.map(author => this.renderAuthorCard(author)).join('');
        container.innerHTML = `<div class="row">${authorsHTML}</div>`;
        
        // Ajout des event listeners après le rendu
        this.attachAuthorCardEventListeners();
    }

    /**
     * Attache les event listeners aux boutons des cartes d'auteurs
     */
    attachAuthorCardEventListeners() {
        // Boutons de détails (œil)
        document.querySelectorAll('.author-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const authorId = btn.getAttribute('data-author-id');
                console.log('Clic sur détails auteur, ID:', authorId);
                this.showAuthorDetails(authorId);
            });
        });

        // Boutons d'édition
        document.querySelectorAll('.author-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const authorId = btn.getAttribute('data-author-id');
                this.showAuthorModal(authorId);
            });
        });

        // Boutons de suppression
        document.querySelectorAll('.author-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const authorId = btn.getAttribute('data-author-id');
                this.deleteAuthor(authorId);
            });
        });
    }

    /**
     * Rendu d'une carte d'auteur
     * @param {Object} author - Auteur à afficher
     * @returns {string} - HTML de la carte
     */
    renderAuthorCard(author) {
        const bookCount = this.getAuthorBookCount(author.name);
        const birthYear = author.birthDate ? new Date(author.birthDate).getFullYear() : null;
        const age = birthYear ? new Date().getFullYear() - birthYear : null;
        const photoUrl = author.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face';
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card author-card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="me-3">
                                <img src="${photoUrl}" alt="${author.name}" 
                                     class="rounded-circle" 
                                     style="width: 60px; height: 60px; object-fit: cover;"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="avatar-circle" style="display: none;">
                                    <i class="fas fa-user fa-2x text-muted"></i>
                                </div>
                            </div>
                            <div>
                                <h5 class="card-title mb-1">${author.name}</h5>
                                ${author.nationality ? `
                                    <p class="card-text text-muted small mb-0">
                                        <i class="fas fa-globe"></i> ${author.nationality}
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                        
                        ${birthYear ? `
                            <p class="card-text text-muted small mb-2">
                                <i class="fas fa-birthday-cake"></i> 
                                ${birthYear}
                            </p>
                        ` : ''}
                        
                        <p class="card-text text-muted small mb-2">
                            <i class="fas fa-book"></i> 
                            ${bookCount} livre${bookCount !== 1 ? 's' : ''}
                        </p>
                        
                        ${author.biography ? `
                            <p class="card-text small text-truncate" style="max-height: 3em; overflow: hidden;">
                                ${author.biography}
                            </p>
                        ` : ''}
                        
                        <div class="mt-auto pt-2">
                            <button class="btn btn-sm btn-outline-primary me-1 author-details-btn" 
                                    data-author-id="${author.id}">
                                <i class="fas fa-eye"></i> Détails
                            </button>
                            <button class="btn btn-sm btn-outline-secondary me-1 author-edit-btn" 
                                    data-author-id="${author.id}">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="btn btn-sm btn-outline-danger author-delete-btn" 
                                    data-author-id="${author.id}">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Affichage des détails d'un auteur
     * @param {string} id - ID de l'auteur
     */
    showAuthorDetails(id) {
        console.log('showAuthorDetails appelé avec ID:', id);
        
        const author = this.authors.find(a => a.id == id); // Utilisation de == pour être plus flexible
        if (!author) {
            console.error('Auteur non trouvé:', id);
            console.log('Auteurs disponibles:', this.authors.map(a => ({id: a.id, name: a.name})));
            alert('Auteur non trouvé !');
            return;
        }

        console.log('Auteur trouvé:', author);

        const bookCount = this.getAuthorBookCount(author.name);
        
        // Amélioration de la gestion des dates avec validation robuste
        let birthDate = 'Non renseignée';
        let age = null;
        
        if (author.birthDate) {
            try {
                // Essayer plusieurs formats de date
                let date = null;
                
                // Si c'est déjà un objet Date
                if (author.birthDate instanceof Date) {
                    date = author.birthDate;
                } 
                // Si c'est une chaîne ISO
                else if (typeof author.birthDate === 'string') {
                    // Nettoyer la chaîne et essayer de la parser
                    const cleanDateStr = author.birthDate.trim();
                    date = new Date(cleanDateStr);
                    
                    // Si la date n'est pas valide, essayer d'autres formats
                    if (isNaN(date.getTime())) {
                        // Essayer format YYYY-MM-DD
                        if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            date = new Date(cleanDateStr + 'T00:00:00.000Z');
                        }
                        // Essayer format YYYY-MM-DD avec année sur 4 chiffres commençant par 0
                        else if (cleanDateStr.match(/^0\d{3}-\d{2}-\d{2}$/)) {
                            date = new Date(cleanDateStr + 'T00:00:00.000Z');
                        }
                    }
                }
                
                // Vérifier si la date est valide
                if (date && !isNaN(date.getTime())) {
                    birthDate = date.toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    const currentYear = new Date().getFullYear();
                    const birthYear = date.getFullYear();
                    
                    // Calculer l'âge seulement si l'année semble raisonnable
                    if (birthYear > 0 && birthYear <= currentYear) {
                        age = currentYear - birthYear;
                        
                        // Ajuster l'âge si l'anniversaire n'est pas encore passé cette année
                        const currentDate = new Date();
                        const birthdayThisYear = new Date(currentYear, date.getMonth(), date.getDate());
                        if (currentDate < birthdayThisYear) {
                            age--;
                        }
                    }
                } else {
                    console.warn('Date de naissance invalide pour', author.name, ':', author.birthDate);
                }
            } catch (error) {
                console.error('Erreur de parsing de date de naissance:', error, 'pour', author.name);
            }
        }
        
        // Gestion robuste de dateAdded
        let dateAdded = 'Non renseignée';
        if (author.dateAdded) {
            try {
                let addedDate = null;
                
                if (author.dateAdded instanceof Date) {
                    addedDate = author.dateAdded;
                } else if (typeof author.dateAdded === 'string') {
                    addedDate = new Date(author.dateAdded);
                }
                
                if (addedDate && !isNaN(addedDate.getTime())) {
                    dateAdded = addedDate.toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                } else {
                    console.warn('Date d\'ajout invalide pour', author.name, ':', author.dateAdded);
                }
            } catch (error) {
                console.error('Erreur de parsing de dateAdded:', error, 'pour', author.name);
            }
        }
        
        const photoUrl = author.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face';

        // Suppression de l'ancien modal s'il existe
        const existingModal = document.getElementById('authorDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        const detailsHTML = `
            <div class="modal fade" id="authorDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${author.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-4 text-center">
                                    <img src="${photoUrl}" alt="${author.name}" 
                                         class="rounded-circle mb-3" 
                                         style="width: 150px; height: 150px; object-fit: cover;"
                                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="avatar-circle-large d-none justify-content-center align-items-center rounded-circle bg-light" 
                                         style="width: 150px; height: 150px;">
                                        <i class="fas fa-user fa-4x text-muted"></i>
                                    </div>
                                </div>
                                <div class="col-md-8">
                                    <table class="table table-borderless">
                                        <tr><td><strong>Nom:</strong></td><td>${author.name}</td></tr>
                                        ${author.nationality ? `<tr><td><strong>Nationalité:</strong></td><td>${author.nationality}</td></tr>` : ''}
                                        <tr><td><strong>Date de naissance:</strong></td><td>${birthDate}</td></tr>
                                        <tr><td><strong>Nombre de livres:</strong></td><td>${bookCount}</td></tr>
                                        <tr><td><strong>Ajouté le:</strong></td><td>${dateAdded}</td></tr>
                                    </table>
                                    ${author.biography ? `
                                        <div class="mt-3">
                                            <strong>Biographie:</strong>
                                            <p class="mt-2">${author.biography}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            ${bookCount > 0 ? `
                                <div class="mt-4">
                                    <h6>Livres de cet auteur:</h6>
                                    <div id="author-books-list">
                                        ${this.getAuthorBooksList(author.name)}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                            <button type="button" class="btn btn-primary" onclick="authorManager.showAuthorModal('${author.id}')" data-bs-dismiss="modal">
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
            console.log('Tentative d\'ouverture du modal auteur...');
            const modalElement = document.getElementById('authorDetailsModal');
            console.log('Élément modal auteur trouvé:', !!modalElement);
            console.log('Bootstrap disponible:', typeof bootstrap !== 'undefined');
            
            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                console.log('Modal auteur ouvert avec succès');
            } else {
                console.error('Bootstrap non disponible');
                alert('Erreur: Bootstrap non chargé');
            }
        } catch (error) {
            console.error('Erreur lors de l\'affichage du modal auteur:', error);
            alert('Erreur lors de l\'affichage des détails: ' + error.message);
        }
    }

    /**
     * Obtention de la liste des livres d'un auteur
     * @param {string} authorName - Nom de l'auteur
     * @returns {string} - HTML de la liste des livres
     */
    getAuthorBooksList(authorName) {
        if (!window.bookManager) return '<p class="text-muted">Aucun livre trouvé</p>';

        const books = window.bookManager.getAllBooks().filter(book => 
            book.author.toLowerCase() === authorName.toLowerCase()
        );

        if (books.length === 0) {
            return '<p class="text-muted">Aucun livre trouvé</p>';
        }

        return books.map(book => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <strong>${book.title}</strong>
                    <br>
                    <small class="text-muted">${book.genre} • ${book.year || 'Année inconnue'}</small>
                </div>
                <span class="badge ${book.available ? 'bg-success' : 'bg-warning'}">
                    ${book.available ? 'Disponible' : 'Indisponible'}
                </span>
            </div>
        `).join('');
    }

    /**
     * Affichage d'un toast de notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de toast (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        // Implémentation simple avec alert pour le moment
        if (type === 'error') {
            alert('Erreur: ' + message);
        } else {
            alert(message);
        }
    }

    /**
     * Obtention de tous les auteurs
     * @returns {Array} - Liste des auteurs
     */
    getAllAuthors() {
        return [...this.authors];
    }

    /**
     * Obtention d'un auteur par ID
     * @param {string} id - ID de l'auteur
     * @returns {Object|null} - Auteur trouvé ou null
     */
    getAuthorById(id) {
        return this.authors.find(author => author.id === id) || null;
    }

    /**
     * Obtention des statistiques des auteurs
     * @returns {Object} - Statistiques
     */
    getAuthorStats() {
        const stats = {
            total: this.authors.length,
            nationalities: {},
            ageGroups: {
                'Moins de 30': 0,
                '30-50': 0,
                '50-70': 0,
                'Plus de 70': 0,
                'Inconnu': 0
            }
        };

        this.authors.forEach(author => {
            // Comptage par nationalité
            const nationality = author.nationality || 'Non renseignée';
            stats.nationalities[nationality] = (stats.nationalities[nationality] || 0) + 1;
            
            // Comptage par groupe d'âge
            if (author.birthDate) {
                const age = new Date().getFullYear() - new Date(author.birthDate).getFullYear();
                if (age < 30) {
                    stats.ageGroups['Moins de 30']++;
                } else if (age < 50) {
                    stats.ageGroups['30-50']++;
                } else if (age < 70) {
                    stats.ageGroups['50-70']++;
                } else {
                    stats.ageGroups['Plus de 70']++;
                }
            } else {
                stats.ageGroups['Inconnu']++;
            }
        });

        return stats;
    }
}
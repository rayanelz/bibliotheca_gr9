/**
 * BibliothecaApp - Application principale
 */
class BibliothecaApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.managers = {};
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialisation de l'application
     */
    async init() {
        try {
            
            if (!this.checkStorageAvailability()) {
                this.showError('LocalStorage non disponible. L\'application ne peut pas fonctionner correctement.');
                return;
            }

            
            this.initializeManagers();
            
            
            this.setupNavigation();
            
           
            this.setupGlobalEvents();
            
           
            await this.loadInitialData();
            
           
            this.navigate('dashboard');
            
            this.isInitialized = true;
            console.log('Bibliotheca Dashboard initialisé avec succès');
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors de l\'initialisation de l\'application');
        }
    }

    /**
     * Vérification de la disponibilité du LocalStorage
     * @returns {boolean} - Disponibilité
     */
    checkStorageAvailability() {
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
     * Initialisation des managers
     */
    initializeManagers() {
        
        this.managers.storage = new StorageManager();
        
       
        this.managers.api = new APIClient();
        
        
        this.managers.book = new BookManager(this.managers.storage, this.managers.api);
        
       
        this.managers.author = new AuthorManager(this.managers.storage);
        
       
        this.managers.dashboard = new DashboardManager(
            this.managers.book, 
            this.managers.author, 
            this.managers.api
        );

        
        window.bookManager = this.managers.book;
        window.authorManager = this.managers.author;
        window.dashboardManager = this.managers.dashboard;
        window.apiClient = this.managers.api;
        
        
        console.log('Managers exposés:', {
            bookManager: !!window.bookManager,
            authorManager: !!window.authorManager,
            dashboardManager: !!window.dashboardManager
        });
    }

    /**
     * Configuration de la navigation
     */
    setupNavigation() {
        
        window.addEventListener('hashchange', () => {
            const section = window.location.hash.substring(1) || 'dashboard';
            this.navigate(section);
        });

        const navLinks = document.querySelectorAll('[data-section]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigate(section);
            });
        });

       
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }

    /**
     * Configuration des événements globaux
     */
    setupGlobalEvents() {
        
        window.addEventListener('error', (event) => {
            console.error('Erreur globale:', event.error);
            this.showError('Une erreur inattendue s\'est produite');
        });

      
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesse rejetée:', event.reason);
            event.preventDefault();
        });

        
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });

      
        window.addEventListener('resize', () => {
            this.handleResize();
        });

      
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Chargement initial des données
     */
    async loadInitialData() {
        try {
          
            this.managers.book.loadBooks();
            this.managers.author.loadAuthors();
            
            
            this.managers.dashboard.updateDashboard();
            
            
            setTimeout(() => {
                this.managers.api.testConnectivity();
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    /**
     * Navigation vers une section
     * @param {string} section - Section cible
     */
    navigate(section) {
        if (!this.isValidSection(section)) {
            section = 'dashboard';
        }

        const sections = document.querySelectorAll('.content-section');
        sections.forEach(s => s.classList.remove('active'));

        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        this.updateActiveNavigation(section);

        if (window.location.hash !== `#${section}`) {
            window.location.hash = section;
        }

        this.currentSection = section;

        this.handleSectionChange(section);
    }

    /**
     * Vérification de la validité d'une section
     * @param {string} section - Section à vérifier
     * @returns {boolean} - Validité
     */
    isValidSection(section) {
        const validSections = ['dashboard', 'books', 'authors', 'statistics'];
        return validSections.includes(section);
    }

    /**
     * Mise à jour de la navigation active
     * @param {string} section - Section active
     */
    updateActiveNavigation(section) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));

        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Gestion des changements de section
     * @param {string} section - Nouvelle section
     */
    handleSectionChange(section) {
        switch (section) {
            case 'dashboard':
                if (this.managers.dashboard) {
                    this.managers.dashboard.updateDashboard();
                }
                break;
            
            case 'books':
                if (this.managers.book) {
                    this.managers.book.renderBooksList();
                }
                break;
            
            case 'authors':
                if (this.managers.author) {
                    this.managers.author.renderAuthorsList();
                }
                break;
            
            case 'statistics':
                if (this.managers.dashboard) {
                    this.managers.dashboard.updateAdvancedChart();
                }
                break;
        }
    }

    /**
     * Basculement de la sidebar
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('content');
        
        if (sidebar && content) {
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        }
    }

    /**
     * Gestion du redimensionnement
     */
    handleResize() {
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const content = document.getElementById('content');
            
            if (sidebar && content) {
                sidebar.classList.add('active');
                content.classList.remove('active');
            }
        }
        if (this.managers.dashboard && this.managers.dashboard.charts) {
            Object.values(this.managers.dashboard.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }
    }

    /**
     * Gestion des raccourcis clavier
     * @param {KeyboardEvent} e - Événement clavier
     */
    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveAllData();
            this.showToast('Données sauvegardées', 'success');
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && this.currentSection === 'books') {
            e.preventDefault();
            this.managers.book.showBookModal();
        }

        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }

        if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
            const sections = ['dashboard', 'books', 'authors', 'statistics'];
            const sectionIndex = parseInt(e.key) - 1;
            if (sections[sectionIndex]) {
                this.navigate(sections[sectionIndex]);
            }
        }
    }

    /**
     * Sauvegarde de toutes les données
     */
    saveAllData() {
        try {
            if (this.managers.book) {
                this.managers.book.saveBooks();
            }
            if (this.managers.author) {
                this.managers.author.saveAuthors();
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    /**
     * Affichage d'un message d'erreur
     * @param {string} message - Message d'erreur
     */
    showError(message) {
        alert('Erreur: ' + message);
        console.error(message);
    }

    /**
     * Affichage d'un toast de notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de toast (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        if (type === 'error') {
            alert('Erreur: ' + message);
        } else {
            alert(message);
        }
    }

    /**
     * Export de toutes les données
     * @returns {Object} - Données exportées
     */
    exportAllData() {
        return {
            books: this.managers.book.getAllBooks(),
            authors: this.managers.author.getAllAuthors(),
            stats: this.managers.dashboard.generateStatsReport(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import de données
     * @param {Object} data - Données à importer
     * @returns {boolean} - Succès de l'import
     */
    importData(data) {
        try {
            if (data.books && Array.isArray(data.books)) {
                this.managers.storage.saveBooks(data.books);
                this.managers.book.loadBooks();
            }
            
            if (data.authors && Array.isArray(data.authors)) {
                this.managers.storage.saveAuthors(data.authors);
                this.managers.author.loadAuthors();
            }
            this.managers.dashboard.updateDashboard();
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            return false;
        }
    }

    /**
     * Réinitialisation de l'application
     */
    reset() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
            try {
                this.managers.storage.resetToSampleData();
                
                this.managers.book.loadBooks();
                this.managers.author.loadAuthors();
                
                this.managers.dashboard.updateDashboard();
                
                this.showToast('Application réinitialisée avec les données d\'exemple', 'success');
                
            } catch (error) {
                console.error('Erreur lors de la réinitialisation:', error);
                this.showError('Erreur lors de la réinitialisation');
            }
        }
    }

    /**
     * Force le chargement des données d'exemple
     */
    loadSampleData() {
        try {
            this.managers.storage.resetToSampleData();
            
            this.managers.book.loadBooks();
            this.managers.author.loadAuthors();
            
            this.managers.dashboard.updateDashboard();
            
            this.handleSectionChange(this.currentSection);
            
            console.log('Données d\'exemple chargées avec succès');
            
        } catch (error) {
            console.error('Erreur lors du chargement des données d\'exemple:', error);
        }
    }

    /**
     * Force le rechargement des données au démarrage
     */
    forceLoadSampleData() {
        localStorage.removeItem('bibliotheca_books');
        localStorage.removeItem('bibliotheca_authors');
        
        this.managers.storage.initializeStorage();
        
        this.loadSampleData();
    }

    /**
     * Obtention des informations de l'application
     * @returns {Object} - Informations de l'application
     */
    getAppInfo() {
        return {
            name: 'Bibliotheca Dashboard',
            version: '1.0.0',
            description: 'Système de gestion de bibliothèque avec dashboard analytique',
            author: 'Kiro AI Assistant',
            initialized: this.isInitialized,
            currentSection: this.currentSection,
            dataStats: {
                books: this.managers.book ? this.managers.book.getAllBooks().length : 0,
                authors: this.managers.author ? this.managers.author.getAllAuthors().length : 0
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.forceLoadSampleData && (!localStorage.getItem('bibliotheca_books') || JSON.parse(localStorage.getItem('bibliotheca_books')).length === 0)) {
        console.log('Chargement forcé des données d\'exemple...');
        window.forceLoadSampleData();
        return;
    }
    
    window.bibliothecaApp = new BibliothecaApp();
});

window.showToast = function(message, type = 'info') {
    if (window.bibliothecaApp) {
        window.bibliothecaApp.showToast(message, type);
    }
};

window.exportData = function() {
    if (window.bibliothecaApp) {
        const data = window.bibliothecaApp.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bibliotheca-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

window.importData = function(file) {
    if (!file || !window.bibliothecaApp) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const success = window.bibliothecaApp.importData(data);
            if (success) {
                window.showToast('Données importées avec succès', 'success');
            } else {
                window.showToast('Erreur lors de l\'import des données', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            window.showToast('Fichier d\'import invalide', 'error');
        }
    };
    reader.readAsText(file);
};
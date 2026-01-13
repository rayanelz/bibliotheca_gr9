/**
 * APIClient - Client pour l'intégration avec OpenLibrary API
 */
class APIClient {
    constructor() {
        this.baseURL = 'https://openlibrary.org';
        this.searchURL = 'https://openlibrary.org/search.json';
        this.timeout = 10000;
        this.isOnline = navigator.onLine;
        this.setupNetworkListeners();
    }

    /**
     * Configuration des listeners réseau
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateAPIStatus('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateAPIStatus('offline');
        });
    }

    /**
     * Recherche de livres par titre
     * @param {string} title - Titre à rechercher
     * @param {number} limit - Nombre de résultats (défaut: 10)
     * @returns {Promise<Array>} - Résultats de recherche
     */
    async searchBooksByTitle(title, limit = 10) {
        if (!this.isOnline) {
            throw new Error('Connexion Internet requise');
        }

        try {
            const params = new URLSearchParams({
                title: title,
                limit: limit,
                fields: 'key,title,author_name,first_publish_year,isbn,subject,cover_i'
            });

            const response = await this.fetchWithTimeout(`${this.searchURL}?${params}`);
            const data = await response.json();

            return this.processSearchResults(data.docs || []);
        } catch (error) {
            this.handleAPIError(error);
            throw error;
        }
    }

    /**
     * Recherche de livres par auteur
     * @param {string} author - Nom de l'auteur
     * @param {number} limit - Nombre de résultats
     * @returns {Promise<Array>} - Résultats de recherche
     */
    async searchBooksByAuthor(author, limit = 10) {
        if (!this.isOnline) {
            throw new Error('Connexion Internet requise');
        }

        try {
            const params = new URLSearchParams({
                author: author,
                limit: limit,
                fields: 'key,title,author_name,first_publish_year,isbn,subject,cover_i'
            });

            const response = await this.fetchWithTimeout(`${this.searchURL}?${params}`);
            const data = await response.json();

            return this.processSearchResults(data.docs || []);
        } catch (error) {
            this.handleAPIError(error);
            throw error;
        }
    }

    /**
     * Obtention des détails d'un livre par ISBN
     * @param {string} isbn - ISBN du livre
     * @returns {Promise<Object>} - Détails du livre
     */
    async getBookDetails(isbn) {
        if (!this.isOnline) {
            throw new Error('Connexion Internet requise');
        }

        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}/isbn/${isbn}.json`);
            const data = await response.json();

            return this.processBookDetails(data);
        } catch (error) {
            this.handleAPIError(error);
            throw error;
        }
    }

    /**
     * Obtention d'informations sur un auteur
     * @param {string} authorKey - Clé de l'auteur OpenLibrary
     * @returns {Promise<Object>} - Informations de l'auteur
     */
    async getAuthorInfo(authorKey) {
        if (!this.isOnline) {
            throw new Error('Connexion Internet requise');
        }

        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}${authorKey}.json`);
            const data = await response.json();

            return this.processAuthorInfo(data);
        } catch (error) {
            this.handleAPIError(error);
            throw error;
        }
    }

    /**
     * Fetch avec timeout
     * @param {string} url - URL à appeler
     * @param {Object} options - Options de fetch
     * @returns {Promise<Response>} - Réponse HTTP
     */
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Test de validité d'une URL d'image
     * @param {string} url - URL à tester
     * @returns {Promise<boolean>} - Validité de l'URL
     */
    async testImageURL(url) {
        if (!url) return false;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            
            setTimeout(() => resolve(false), 5000);
        });
    }

    /**
     * Traitement des résultats de recherche
     * @param {Array} docs - Documents de l'API
     * @returns {Array} - Résultats traités
     */
    processSearchResults(docs) {
        return docs.map(doc => {
            const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null;
            
            console.log('Processing book:', doc.title);
            console.log('Cover ID from API:', doc.cover_i);
            console.log('Generated cover URL:', coverUrl);
            
            return {
                key: doc.key,
                title: doc.title || 'Titre inconnu',
                authors: doc.author_name || ['Auteur inconnu'],
                publishYear: doc.first_publish_year || null,
                isbn: doc.isbn ? doc.isbn[0] : null,
                subjects: doc.subject ? doc.subject.slice(0, 5) : [],
                coverUrl: coverUrl
            };
        });
    }

    /**
     * Traitement des détails d'un livre
     * @param {Object} data - Données de l'API
     * @returns {Object} - Détails traités
     */
    processBookDetails(data) {
        return {
            title: data.title || 'Titre inconnu',
            authors: data.authors ? data.authors.map(a => a.name) : ['Auteur inconnu'],
            publishDate: data.publish_date || null,
            publishers: data.publishers || [],
            description: data.description ? 
                (typeof data.description === 'string' ? data.description : data.description.value) : null,
            subjects: data.subjects || [],
            isbn: data.isbn_10 || data.isbn_13 || null,
            pages: data.number_of_pages || null,
            coverUrl: data.covers ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg` : null
        };
    }

    /**
     * Traitement des informations d'auteur
     * @param {Object} data - Données de l'API
     * @returns {Object} - Informations traitées
     */
    processAuthorInfo(data) {
        return {
            name: data.name || 'Nom inconnu',
            birthDate: data.birth_date || null,
            deathDate: data.death_date || null,
            biography: data.bio ? 
                (typeof data.bio === 'string' ? data.bio : data.bio.value) : null,
            photoUrl: data.photos ? `https://covers.openlibrary.org/a/id/${data.photos[0]}-M.jpg` : null,
            alternateNames: data.alternate_names || []
        };
    }

    /**
     * Enrichissement des données locales avec les données API
     * @param {Object} localBook - Livre local
     * @param {Object} apiData - Données de l'API
     * @returns {Object} - Livre enrichi
     */
    enrichLocalData(localBook, apiData) {
        const enriched = { ...localBook };

      
        if (!enriched.coverUrl && apiData.coverUrl) {
            enriched.coverUrl = apiData.coverUrl;
        }

    
        if (!enriched.description && apiData.description) {
            enriched.description = apiData.description;
        }

        
        if (apiData.subjects && apiData.subjects.length > 0) {
            enriched.apiSubjects = apiData.subjects;
        }

        
        if (apiData.publishers && apiData.publishers.length > 0) {
            enriched.publishers = apiData.publishers;
        }

        
        enriched.enrichedFromAPI = true;
        enriched.lastEnriched = new Date().toISOString();

        return enriched;
    }

    /**
     * Gestion des erreurs API
     * @param {Error} error - Erreur rencontrée
     */
    handleAPIError(error) {
        console.error('Erreur API:', error);

        let message = 'Erreur de connexion à l\'API';
        
        if (error.name === 'AbortError') {
            message = 'Timeout de connexion à l\'API';
        } else if (error.message.includes('HTTP 404')) {
            message = 'Ressource non trouvée';
        } else if (error.message.includes('HTTP 429')) {
            message = 'Trop de requêtes, veuillez patienter';
        } else if (!this.isOnline) {
            message = 'Connexion Internet requise';
        }

        this.updateAPIStatus('error', message);
    }

    /**
     * Mise à jour du statut API dans l'interface
     * @param {string} status - Statut (online, offline, error, loading)
     * @param {string} message - Message optionnel
     */
    updateAPIStatus(status, message = '') {
        const statusElement = document.getElementById('api-status');
        if (!statusElement) return;

        let content = '';
        let className = '';

        switch (status) {
            case 'online':
                content = `
                    <i class="fas fa-check-circle fa-2x text-success"></i>
                    <p class="mt-2 text-success">API OpenLibrary connectée</p>
                `;
                className = 'api-status-online';
                break;
            case 'offline':
                content = `
                    <i class="fas fa-times-circle fa-2x text-danger"></i>
                    <p class="mt-2 text-danger">Hors ligne</p>
                `;
                className = 'api-status-offline';
                break;
            case 'error':
                content = `
                    <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                    <p class="mt-2 text-warning">${message || 'Erreur API'}</p>
                `;
                className = 'api-status-error';
                break;
            case 'loading':
                content = `
                    <i class="fas fa-spinner fa-spin fa-2x text-info"></i>
                    <p class="mt-2 text-info">Chargement...</p>
                `;
                className = 'api-status-loading';
                break;
        }

        statusElement.innerHTML = content;
        statusElement.className = `text-center ${className}`;
    }

    /**
     * Test de connectivité API
     * @returns {Promise<boolean>} - Statut de connectivité
     */
    async testConnectivity() {
        try {
            this.updateAPIStatus('loading');
            const response = await this.fetchWithTimeout(`${this.baseURL}/search.json?q=test&limit=1`);
            this.updateAPIStatus('online');
            return true;
        } catch (error) {
            this.updateAPIStatus('error', 'API indisponible');
            return false;
        }
    }

    /**
     * Obtention de statistiques depuis l'API
     * @returns {Promise<Object>} - Statistiques
     */
    async getAPIStats() {
        try {
            
            const response = await this.searchBooksByTitle('popular', 50);
            
            const genres = {};
            const years = {};
            
            response.forEach(book => {
                
                if (book.subjects) {
                    book.subjects.forEach(subject => {
                        genres[subject] = (genres[subject] || 0) + 1;
                    });
                }
                
                
                if (book.publishYear) {
                    const decade = Math.floor(book.publishYear / 10) * 10;
                    years[decade] = (years[decade] || 0) + 1;
                }
            });

            return {
                totalResults: response.length,
                topGenres: Object.entries(genres)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([genre, count]) => ({ genre, count })),
                yearDistribution: years
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des stats API:', error);
            return null;
        }
    }
}
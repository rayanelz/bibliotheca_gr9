/**
 * DashboardManager - Gestionnaire du dashboard avec KPI et graphiques
 */
class DashboardManager {
    constructor(bookManager, authorManager, apiClient) {
        this.bookManager = bookManager;
        this.authorManager = authorManager;
        this.apiClient = apiClient;
        this.charts = {};
        
        this.initializeDashboard();
    }

    /**
     * Initialisation du dashboard
     */
    async initializeDashboard() {
        this.updateKPIs();
        this.initializeCharts();
        
        // Test de connectivité API
        if (this.apiClient) {
            await this.apiClient.testConnectivity();
        }
    }

    /**
     * Mise à jour complète du dashboard
     */
    updateDashboard() {
        this.updateKPIs();
        this.updateCharts();
    }

    /**
     * Mise à jour des KPI
     */
    updateKPIs() {
        const bookStats = this.bookManager.getBookStats();
        const authorStats = this.authorManager.getAuthorStats();

        // KPI 1: Total des livres
        this.updateKPI('total-books', bookStats.total);

        // KPI 2: Total des auteurs
        this.updateKPI('total-authors', authorStats.total);

        // KPI 3: Livres disponibles
        this.updateKPI('available-books', bookStats.available);

        // KPI 4: Genre populaire
        const popularGenre = this.getMostPopularGenre(bookStats.genres);
        this.updateKPI('popular-genre', popularGenre);
    }

    /**
     * Mise à jour d'un KPI spécifique
     * @param {string} kpiId - ID de l'élément KPI
     * @param {string|number} value - Valeur à afficher
     */
    updateKPI(kpiId, value) {
        const element = document.getElementById(kpiId);
        if (element) {
            // Animation de compteur pour les valeurs numériques
            if (typeof value === 'number') {
                this.animateCounter(element, value);
            } else {
                element.textContent = value;
            }
        }
    }

    /**
     * Animation de compteur pour les KPI numériques
     * @param {HTMLElement} element - Élément à animer
     * @param {number} targetValue - Valeur cible
     */
    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - currentValue) / 20);
        
        if (currentValue < targetValue) {
            element.textContent = Math.min(currentValue + increment, targetValue);
            setTimeout(() => this.animateCounter(element, targetValue), 50);
        } else if (currentValue > targetValue) {
            element.textContent = Math.max(currentValue - Math.abs(increment), targetValue);
            setTimeout(() => this.animateCounter(element, targetValue), 50);
        }
    }

    /**
     * Obtention du genre le plus populaire
     * @param {Object} genres - Statistiques des genres
     * @returns {string} - Genre le plus populaire
     */
    getMostPopularGenre(genres) {
        if (!genres || Object.keys(genres).length === 0) {
            return 'Aucun';
        }

        const sortedGenres = Object.entries(genres)
            .sort(([,a], [,b]) => b - a);
        
        return sortedGenres[0][0];
    }

    /**
     * Initialisation des graphiques
     */
    initializeCharts() {
        this.initializeGenreChart();
        this.initializeAdvancedChart();
    }

    /**
     * Mise à jour de tous les graphiques
     */
    updateCharts() {
        this.updateGenreChart();
        this.updateAdvancedChart();
    }

    /**
     * Initialisation du graphique des genres
     */
    initializeGenreChart() {
        const ctx = document.getElementById('genreChart');
        if (!ctx) return;

        const bookStats = this.bookManager.getBookStats();
        const genreData = this.prepareGenreChartData(bookStats.genres);

        this.charts.genreChart = new Chart(ctx, {
            type: 'doughnut',
            data: genreData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    /**
     * Préparation des données pour le graphique des genres
     * @param {Object} genres - Statistiques des genres
     * @returns {Object} - Données formatées pour Chart.js
     */
    prepareGenreChartData(genres) {
        const labels = Object.keys(genres);
        const data = Object.values(genres);
        
        // Couleurs prédéfinies pour les genres
        const colors = [
            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
            '#858796', '#5a5c69', '#f8f9fc', '#5e72e4', '#02c0ce'
        ];

        return {
            labels: labels.length > 0 ? labels : ['Aucun genre'],
            datasets: [{
                data: data.length > 0 ? data : [1],
                backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };
    }

    /**
     * Mise à jour du graphique des genres
     */
    updateGenreChart() {
        if (!this.charts.genreChart) return;

        const bookStats = this.bookManager.getBookStats();
        const genreData = this.prepareGenreChartData(bookStats.genres);

        this.charts.genreChart.data = genreData;
        this.charts.genreChart.update('active');
    }

    /**
     * Initialisation du graphique avancé (statistiques)
     */
    initializeAdvancedChart() {
        const ctx = document.getElementById('advancedChart');
        if (!ctx) return;

        const chartData = this.prepareAdvancedChartData();

        this.charts.advancedChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Répartition des Livres par Décennie'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Décennies'
                        }
                    }
                }
            }
        });
    }

    /**
     * Préparation des données pour le graphique avancé
     * @returns {Object} - Données formatées pour Chart.js
     */
    prepareAdvancedChartData() {
        const books = this.bookManager.getAllBooks();
        const decades = {};

        // Groupement par décennie
        books.forEach(book => {
            if (book.year) {
                const decade = Math.floor(book.year / 10) * 10;
                const decadeLabel = `${decade}s`;
                decades[decadeLabel] = (decades[decadeLabel] || 0) + 1;
            }
        });

        // Tri des décennies
        const sortedDecades = Object.entries(decades)
            .sort(([a], [b]) => parseInt(a) - parseInt(b));

        const labels = sortedDecades.map(([decade]) => decade);
        const data = sortedDecades.map(([, count]) => count);

        return {
            labels: labels.length > 0 ? labels : ['Aucune donnée'],
            datasets: [{
                label: 'Nombre de livres',
                data: data.length > 0 ? data : [0],
                backgroundColor: 'rgba(78, 115, 223, 0.8)',
                borderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        };
    }

    /**
     * Mise à jour du graphique avancé
     */
    updateAdvancedChart() {
        if (!this.charts.advancedChart) return;

        const chartData = this.prepareAdvancedChartData();
        this.charts.advancedChart.data = chartData;
        this.charts.advancedChart.update('active');
    }

    /**
     * Calcul des statistiques générales
     * @returns {Object} - Statistiques complètes
     */
    calculateGeneralStats() {
        const bookStats = this.bookManager.getBookStats();
        const authorStats = this.authorManager.getAuthorStats();
        const books = this.bookManager.getAllBooks();

        // Calcul de la moyenne des années de publication
        const years = books
            .filter(book => book.year)
            .map(book => book.year);
        
        const avgYear = years.length > 0 ? 
            Math.round(years.reduce((sum, year) => sum + year, 0) / years.length) : null;

        // Calcul du pourcentage de disponibilité
        const availabilityRate = bookStats.total > 0 ? 
            Math.round((bookStats.available / bookStats.total) * 100) : 0;

        // Auteur le plus prolifique
        const topAuthor = Object.entries(bookStats.authors)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            totalBooks: bookStats.total,
            totalAuthors: authorStats.total,
            availableBooks: bookStats.available,
            availabilityRate: availabilityRate,
            averagePublishYear: avgYear,
            totalGenres: Object.keys(bookStats.genres).length,
            mostPopularGenre: this.getMostPopularGenre(bookStats.genres),
            topAuthor: topAuthor ? {
                name: topAuthor[0],
                bookCount: topAuthor[1]
            } : null
        };
    }

    /**
     * Génération d'un rapport de statistiques
     * @returns {Object} - Rapport détaillé
     */
    generateStatsReport() {
        const generalStats = this.calculateGeneralStats();
        const bookStats = this.bookManager.getBookStats();
        const authorStats = this.authorManager.getAuthorStats();

        return {
            general: generalStats,
            books: {
                byGenre: bookStats.genres,
                byAuthor: bookStats.authors,
                byYear: bookStats.years
            },
            authors: {
                byNationality: authorStats.nationalities,
                byAgeGroup: authorStats.ageGroups
            },
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Export des statistiques en JSON
     * @returns {string} - JSON des statistiques
     */
    exportStats() {
        const report = this.generateStatsReport();
        return JSON.stringify(report, null, 2);
    }

    // (displayEnrichReport removed)

    /**
     * Mise à jour des statistiques avec données API
     * @param {Object} apiStats - Statistiques de l'API
     */
    updateWithAPIStats(apiStats) {
        if (!apiStats) return;

        // Mise à jour du statut API
        const statusElement = document.getElementById('api-status');
        if (statusElement && apiStats.totalResults) {
            statusElement.innerHTML = `
                <i class="fas fa-check-circle fa-2x text-success"></i>
                <p class="mt-2 text-success">API connectée</p>
                <small class="text-muted">${apiStats.totalResults} résultats disponibles</small>
            `;
        }

        // Intégration des genres populaires de l'API
        if (apiStats.topGenres && apiStats.topGenres.length > 0) {
            this.displayAPIGenres(apiStats.topGenres);
        }
    }

    /**
     * Affichage des genres populaires de l'API
     * @param {Array} topGenres - Genres populaires de l'API
     */
    displayAPIGenres(topGenres) {
        const container = document.getElementById('api-genres');
        if (!container) return;

        const genresHTML = topGenres.map(({ genre, count }) => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-primary">${genre}</span>
                <small class="text-muted">${count}</small>
            </div>
        `).join('');

        container.innerHTML = `
            <h6 class="text-muted">Genres populaires (API)</h6>
            ${genresHTML}
        `;
    }

    /**
     * Rafraîchissement des données depuis l'API
     */
    async refreshAPIData() {
        if (!this.apiClient) return;

        try {
            const apiStats = await this.apiClient.getAPIStats();
            if (apiStats) {
                this.updateWithAPIStats(apiStats);
            }
        } catch (error) {
            console.error('Erreur lors du rafraîchissement des données API:', error);
        }
    }

    /**
     * Recherche et enrichissement automatique
     */
    async autoEnrichBooks() {
        if (!this.apiClient) return;

        const books = this.bookManager.getAllBooks();
        const booksToEnrich = books.filter(book => 
            !book.enrichedFromAPI && (book.isbn || book.title)
        );

        if (booksToEnrich.length === 0) return;

        let enrichedCount = 0;
        const maxEnrichments = 5; // Limite pour éviter trop d'appels API

        for (const book of booksToEnrich.slice(0, maxEnrichments)) {
            try {
                let apiData = null;
                
                // Tentative par ISBN d'abord
                if (book.isbn) {
                    apiData = await this.apiClient.getBookDetails(book.isbn);
                } else if (book.title) {
                    // Sinon par titre
                    const searchResults = await this.apiClient.searchBooksByTitle(book.title, 1);
                    if (searchResults.length > 0) {
                        apiData = searchResults[0];
                    }
                }

                if (apiData) {
                    const enrichedBook = this.apiClient.enrichLocalData(book, apiData);
                    await this.bookManager.updateBook(book.id, enrichedBook);
                    enrichedCount++;
                }

                // Pause entre les appels pour respecter les limites de l'API
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.log(`Échec de l'enrichissement pour "${book.title}":`, error.message);
            }
        }

        if (enrichedCount > 0) {
            this.updateDashboard();
            console.log(`${enrichedCount} livre(s) enrichi(s) avec les données de l'API`);
        }
    }

    /**
     * Initialisation des événements du dashboard
     */
    setupDashboardEvents() {
        // Bouton de rafraîchissement API
        const refreshBtn = document.getElementById('refresh-api-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAPIData());
        }

        // Export des statistiques
        const exportBtn = document.getElementById('export-stats-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const stats = this.exportStats();
                this.downloadJSON(stats, 'bibliotheca-stats.json');
            });
        }
    }

    /**
     * Téléchargement d'un fichier JSON
     * @param {string} content - Contenu JSON
     * @param {string} filename - Nom du fichier
     */
    downloadJSON(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Destruction des graphiques (nettoyage)
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}
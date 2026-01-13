<div align="center">

# 📚 **BIBLIOTHECA DASHBOARD**
### *Présentation Projet - 5 minutes*

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0;">

## 🎯 **QU'EST-CE QUE BIBLIOTHECA DASHBOARD ?**

</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">

### 🚀 **APPLICATION WEB MODERNE**
Gestion de bibliothèque avec  
dashboard analytique temps réel

</div>

<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">

### 💻 **TECHNOLOGIES NATIVES**
HTML5 • CSS3 • JavaScript ES6+  
Bootstrap 5 • Chart.js

</div>

</div>

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">

**🎯 OBJECTIF :** Démontrer les capacités du développement web moderne sans frameworks lourds

</div>

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">

## 🏗️ **ARCHITECTURE MODULAIRE**

</div>

<div style="background-color: #f8f9fa; padding: 25px; border-radius: 12px; margin: 20px 0;">

### 🏛️ **Pattern MVC Client-Side**

<div style="text-align: center; font-family: monospace; font-size: 14px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; border-radius: 10px; margin: 15px 0;">

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      VIEW       │◄──►│   CONTROLLER    │◄──►│     MODEL       │
│   index.html    │    │     app.js      │    │   storage.js    │
│   style.css     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

</div>

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 25px 0;">

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">

### 🎮 **CONTROLLER**
`app.js`  
Orchestration générale

</div>

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">

### 📚 **MANAGERS**
`book-manager.js`  
`author-manager.js`  
`dashboard-manager.js`

</div>

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">

### 💾 **SERVICES**
`storage-manager.js`  
`api-client.js`

</div>

</div>

---

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">

## 📚 **FONCTIONNALITÉS PRINCIPALES**

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 25px 0;">

<div style="background-color: #e8f5e8; padding: 25px; border-radius: 12px; border-left: 5px solid #28a745;">

### ✅ **GESTION LIVRES**
- **CRUD complet** avec validation temps réel
- **Recherche locale** et via API OpenLibrary  
- **Tri multi-critères** (titre, auteur, année, genre)
- **Validation ISBN-10/13** avec algorithme de contrôle

</div>

<div style="background-color: #fff3cd; padding: 25px; border-radius: 12px; border-left: 5px solid #ffc107;">

### 👤 **GESTION AUTEURS**
- **Profils détaillés** avec photos
- **Liaison automatique** avec les livres
- **Statistiques** par auteur

</div>

<div style="background-color: #d1ecf1; padding: 25px; border-radius: 12px; border-left: 5px solid #17a2b8;">

### 📊 **DASHBOARD ANALYTICS**
- **4 KPI temps réel :** Total livres, auteurs, disponibilité, genre populaire
- **Graphiques Chart.js :** Répartition par genre (donut), évolution par décennie (barres)
- **Mise à jour automatique** à chaque modification

</div>

</div>

---

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">

## 💻 **EXEMPLE DE CODE 1 : VALIDATION ISBN**

</div>

<div style="background-color: #f8f9fa; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #007bff;">

### 🔍 **Validation ISBN-10 et ISBN-13 avec algorithme de contrôle**

<div style="background-color: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; margin: 15px 0;">

```javascript
/**
 * Validation ISBN-10 et ISBN-13 avec algorithme de contrôle
 */
validateISBN(isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    if (cleanISBN.length === 10) {
        // Validation ISBN-10
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanISBN[i]) * (10 - i);
        }
        const checkDigit = cleanISBN[9] === 'X' ? 10 : parseInt(cleanISBN[9]);
        return (sum + checkDigit) % 11 === 0;
    }
    
    if (cleanISBN.length === 13) {
        // Validation ISBN-13
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanISBN[i]) * (i % 2 === 0 ? 1 : 3);
        }
        return (10 - (sum % 10)) % 10 === parseInt(cleanISBN[12]);
    }
    
    return false;
}
```

</div>

</div>

---

<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">

## 📊 **EXEMPLE DE CODE 2 : DASHBOARD TEMPS RÉEL**

</div>

<div style="background-color: #f8f9fa; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #28a745;">

### ⚡ **Mise à jour automatique des KPI et graphiques**

<div style="background-color: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; margin: 15px 0;">

```javascript
/**
 * Mise à jour automatique des KPI et graphiques
 */
updateDashboard() {
    const bookStats = this.bookManager.getBookStats();
    const authorStats = this.authorManager.getAuthorStats();

    // Mise à jour KPI
    this.updateKPI('total-books', bookStats.total);
    this.updateKPI('total-authors', authorStats.total);
    this.updateKPI('available-books', bookStats.available);
    
    // Graphique genres (Chart.js)
    const genreData = this.calculateGenreDistribution();
    this.charts.genreChart.data.datasets[0].data = genreData.values;
    this.charts.genreChart.data.labels = genreData.labels;
    this.charts.genreChart.update('active');
    
    // Graphique décennies
    const decadeData = this.calculateDecadeDistribution();
    this.charts.decadeChart.data.datasets[0].data = decadeData.values;
    this.charts.decadeChart.update('active');
}
```

</div>

</div>

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">

## 🌐 **INTÉGRATION API OPENLIBRARY**

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">

<div style="background-color: #e3f2fd; padding: 25px; border-radius: 12px; border-left: 5px solid #2196f3;">

### 🔍 **Enrichissement Automatique**
- **Recherche externe** de livres par titre/auteur
- **Import métadonnées** complètes (titre, auteur, année, genre, couverture)
- **Gestion robuste** des erreurs réseau et mode hors ligne
- **Cache navigateur** pour optimiser les performances

</div>

<div style="background-color: #f3e5f5; padding: 25px; border-radius: 12px; border-left: 5px solid #9c27b0;">

### 🔄 **Processus d'Import**
1. **Recherche utilisateur** → Appel API OpenLibrary
2. **Affichage résultats** avec bouton "Importer"
3. **Validation et normalisation** des données
4. **Sauvegarde LocalStorage** + refresh interface

</div>

</div>

---

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">

## 🚀 **ELEMENTS ESSENTIELS**


</div>

<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin: 25px 0;">

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">

### 📊 **DASHBOARD**
Vue d'ensemble avec  
KPI et graphiques

</div>

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">

### ➕ **AJOUT LIVRE**
Formulaire avec  
validation temps réel

</div>

<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">

### 🔍 **RECHERCHE API**
Import depuis  
OpenLibrary

</div>

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">

### 📈 **ANALYTICS**
Graphiques interactifs  
Chart.js

</div>

</div>

---

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 15px; margin: 30px 0; text-align: center;">

## 🎯 **CONCLUSION**

</div>

<div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; border: 3px solid #007bff;">

### 🏆 **BIBLIOTHECA DASHBOARD**

**Démontre qu'il est possible de créer des applications web modernes et performantes avec les technologies natives du web, sans frameworks complexes.**

<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">

**🎯 RÉSULTAT :** Une solution complète, maintenable et évolutive pour la gestion de bibliothèque avec analytics avancés.

</div>

</div>

---

</div>
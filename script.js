
function showSection(sectionId) {
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById('section-' + sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

const formLivre = document.getElementById('form-livre');
const tableLivresBody = document.getElementById('table-livres-body');


formLivre.addEventListener('submit', function(event) {
    event.preventDefault();

    const titre = document.getElementById('titre').value;
    const auteur = document.getElementById('auteur').value;
    const genre = document.getElementById('genre').value;

    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${titre}</td>
        <td>${auteur}</td>
        <td><span class="badge bg-secondary">${genre}</span></td>
    `;

    tableLivresBody.appendChild(row);

    formLivre.reset();
    
});

showSection('dashboard');
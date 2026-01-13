const SAMPLE_BOOKS = [
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
        dateAdded: "2024-01-15T10:00:00.000Z",
        coverUrl: "https://www.lepetitprince.com/wp-content/uploads/2023/01/COVER-Le-Petit-Prince-FR.jpg"
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
        dateAdded: "2024-01-20T10:00:00.000Z",
        coverUrl: "https://tse4.mm.bing.net/th/id/OIP.yLfxR7OPkncvS649T6sTXAHaLU?pid=Api&P=0&h=180"
    },
    {
        id: 3,
        title: "L'Étranger",
        author: "Albert Camus",
        isbn: "978-2-07-036002-1",
        genre: "Fiction",
        year: 1942,
        rating: 4,
        description: "L'histoire de Meursault, un homme indifférent qui commet un meurtre apparemment sans motif. Une réflexion sur l'absurdité de l'existence.",
        available: false,
        dateAdded: "2024-02-01T10:00:00.000Z",
        coverUrl: "https://tse1.mm.bing.net/th/id/OIP.NrvPHv4FcaVX9GGJaNU31QAAAA?pid=Api&P=0&h=180"
    },
    {
        id: 4,
        title: "Harry Potter à l'école des sorciers",
        author: "J.K. Rowling",
        isbn: "978-2-07-054120-7",
        genre: "Fantasy",
        year: 1997,
        rating: 5,
        description: "Le premier tome des aventures du jeune sorcier Harry Potter à Poudlard. Le début d'une saga magique qui a conquis le monde entier.",
        available: true,
        dateAdded: "2024-02-10T10:00:00.000Z",
        coverUrl: "https://tse4.mm.bing.net/th/id/OIP.Ank3OdojexT74zxmjNHkfAHaKy?pid=Api&P=0&h=180"
    },
    {
        id: 5,
        title: "Sapiens: Une brève histoire de l'humanité",
        author: "Yuval Noah Harari",
        isbn: "978-2-226-25701-7",
        genre: "Non-Fiction",
        year: 2011,
        rating: 4,
        description: "Une exploration fascinante de l'histoire de l'humanité, de la révolution cognitive à la révolution scientifique.",
        available: true,
        dateAdded: "2024-02-15T10:00:00.000Z",
        coverUrl: "https://tse4.mm.bing.net/th/id/OIP.WbcTdIYI32ZSnOK6WJzQwgAAAA?pid=Api&P=0&h=180"
    },
    {
        id: 6,
        title: "Le Seigneur des Anneaux: La Communauté de l'Anneau",
        author: "J.R.R. Tolkien",
        isbn: "978-2-07-061248-4",
        genre: "Fantasy",
        year: 1954,
        rating: 5,
        description: "Le premier tome de l'épopée fantasy la plus célèbre au monde. Frodon et ses compagnons entament leur quête pour détruire l'Anneau Unique.",
        available: true,
        dateAdded: "2024-02-20T10:00:00.000Z",
        coverUrl: "https://tse4.mm.bing.net/th/id/OIP.bAW3OIqde-ubtuvT5kr7BwHaMI?pid=Api&P=0&h=180"
    },
    {
        id: 7,
        title: "Orgueil et Préjugés",
        author: "Jane Austen",
        isbn: "978-2-07-040445-8",
        genre: "Romance",
        year: 1813,
        rating: 4,
        description: "L'histoire d'Elizabeth Bennet et de Mr. Darcy, un classique de la littérature romantique anglaise qui explore les questions de classe et d'amour.",
        available: true,
        dateAdded: "2024-03-01T10:00:00.000Z",
        coverUrl: "https://tse2.mm.bing.net/th/id/OIP.B7t2r04QWAKG5sHHNh5l9QAAAA?pid=Api&P=0&h=180"
    },
    {
        id: 8,
        title: "Bleach",
        author: "Tite Kubo",
        isbn: "978-2-253-12011-2",
        genre: "Thriller",
        year: 2003,
        rating: 5,
        description: "peak 2",
        available: false,
        dateAdded: "2024-03-05T10:00:00.000Z",
        coverUrl: "https://tse1.mm.bing.net/th/id/OIP.cTV2E9cqmCsKotEcpQ0bwAHaLJ?pid=Api&P=0&h=180"
    },
    {
        id: 9,
        title: "Une brève histoire du temps",
        author: "Stephen Hawking",
        isbn: "978-2-08-081238-5",
        genre: "Non-Fiction",
        year: 1988,
        rating: 4,
        description: "Une vulgarisation brillante de la cosmologie moderne, des trous noirs au Big Bang, par l'un des plus grands physiciens de notre temps.",
        available: true,
        dateAdded: "2024-03-10T10:00:00.000Z",
        coverUrl: "https://tse2.mm.bing.net/th/id/OIP.bys-c2wr5FpomSFf8bezVwAAAA?pid=Api&P=0&h=180"
    },
    {
        id: 10,
        title: "Les Fleurs du Mal",
        author: "Charles Baudelaire",
        isbn: "978-2-07-038030-2",
        genre: "Poésie",
        year: 1857,
        rating: 5,
        description: "Le recueil de poèmes le plus célèbre de Baudelaire, explorant la beauté, la décadence et la modernité urbaine du XIXe siècle.",
        available: true,
        dateAdded: "2024-03-15T10:00:00.000Z",
        coverUrl: "https://tse2.mm.bing.net/th/id/OIP.9KykFXHq92YQIi7zMx1VKwAAAA?pid=Api&P=0&h=180"
    },
    {
        id: 11,
        title: "Jujutsu Kaisen",
        author: "Gege Akutami",
        isbn: "978-2-253-17666-9",
        genre: "Science-Fiction",
        year: 2011,
        rating: 4,
        description: "peak",
        available: true,
        dateAdded: "2020-03-20T10:00:00.000Z",
        coverUrl: "https://tse4.mm.bing.net/th/id/OIP.5i2GG1GVuEEKKLwaYn1lngHaLH?pid=Api&P=0&h=180"
    },
    {
        id: 12,
        title: "L'Art de la guerre",
        author: "Sun Tzu",
        isbn: "978-2-08-070349-1",
        genre: "Essai",
        year: -500,
        rating: 4,
        description: "Le traité de stratégie militaire le plus influent de l'histoire, dont les principes s'appliquent encore aujourd'hui au business et à la vie.",
        available: true,
        dateAdded: "2024-03-25T10:00:00.000Z",
        coverUrl: "https://tse1.mm.bing.net/th/id/OIP.DKIvOvDmFhzpeLxb_PcrfQAAAA?pid=Api&P=0&h=180"
    }
];

const SAMPLE_AUTHORS = [
    {
        id: 1,
        name: "Antoine de Saint-Exupéry",
        nationality: "Française",
        birthDate: "1900-06-29T00:00:00.000Z",
        biography: "Écrivain, poète, aviateur et reporter français. Auteur du célèbre 'Petit Prince', il a marqué la littérature par ses récits inspirés de son expérience de pilote.",
        photoUrl: "https://tse1.mm.bing.net/th/id/OIP.NEzmAVobtGiQjPJejEwX_QHaGL?pid=Api&P=0&h=180",
        dateAdded: "2024-01-15T10:00:00.000Z"
    },
    {
        id: 2,
        name: "George Orwell",
        nationality: "Britannique",
        birthDate: "1903-06-25T00:00:00.000Z",
        biography: "Écrivain et journaliste britannique, célèbre pour ses romans dystopiques '1984' et 'La Ferme des animaux'. Critique féroce du totalitarisme.",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/220px-George_Orwell_press_photo.jpg",
        dateAdded: "2024-01-16T10:00:00.000Z"
    },
    {
        id: 3,
        name: "Albert Camus",
        nationality: "Française",
        birthDate: "1913-11-07T00:00:00.000Z",
        biography: "Écrivain, philosophe, romancier, dramaturge et essayiste français. Prix Nobel de littérature en 1957, figure majeure de la philosophie de l'absurde.",
        photoUrl: "https://tse2.mm.bing.net/th/id/OIP.wo5eTBdSCaSlVatQEuOucgHaFj?pid=Api&P=0&h=180",
        dateAdded: "2024-01-17T10:00:00.000Z"
    },
    {
        id: 4,
        name: "J.K. Rowling",
        nationality: "Britannique",
        birthDate: "1965-07-31T00:00:00.000Z",
        biography: "Romancière britannique, créatrice de la saga Harry Potter. L'une des auteures les plus lues au monde, elle a révolutionné la littérature jeunesse.",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/J._K._Rowling_2010.jpg/220px-J._K._Rowling_2010.jpg",
        dateAdded: "2024-01-18T10:00:00.000Z"
    },
    {
        id: 5,
        name: "Yuval Noah Harari",
        nationality: "Israélienne",
        birthDate: "1976-02-24T00:00:00.000Z",
        biography: "Historien et écrivain israélien, professeur à l'Université hébraïque de Jérusalem. Auteur de bestsellers sur l'histoire et l'avenir de l'humanité.",
        photoUrl: "https://tse1.mm.bing.net/th/id/OIP.Off78jzKKMmFjJdeCKUgggHaEc?pid=Api&P=0&h=180",
        dateAdded: "2024-01-19T10:00:00.000Z"
    },
    {
        id: 6,
        name: "J.R.R. Tolkien",
        nationality: "Britannique",
        birthDate: "1892-01-03T00:00:00.000Z",
        biography: "Écrivain, poète, philologue et professeur britannique. Créateur de la Terre du Milieu et père de la fantasy moderne avec 'Le Seigneur des Anneaux'.",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/J._R._R._Tolkien%2C_ca._1925.jpg/220px-J._R._R._Tolkien%2C_ca._1925.jpg",
        dateAdded: "2024-01-20T10:00:00.000Z"
    },
    {
        id: 7,
        name: "Jane Austen",
        nationality: "Britannique",
        birthDate: "1775-12-16T00:00:00.000Z",
        biography: "Romancière anglaise du XIXe siècle, maîtresse du roman de mœurs. Ses œuvres explorent avec finesse les relations sociales de son époque.",
        photoUrl: "https://tse1.mm.bing.net/th/id/OIP.e3nKZ3Mt5Mh1T9UybhFNrQHaE8?pid=Api&P=0&h=180",
        dateAdded: "2024-01-21T10:00:00.000Z"
    },
    {
        id: 8,
        name: "Tite Kubo",
        nationality: "Japonaise",
        birthDate: "1977-06-26T00:00:00.000Z",
        biography: "Mangaka japonais, créateur de la série Bleach. Son œuvre révolutionnaire a marqué le genre du manga et de l'anime avec des personnages emblématiques et une mythologie riche.",
        photoUrl: "https://cdn1.booknode.com/author_picture/224/full/tite-kubo-223816.jpg",
        dateAdded: "2024-01-22T10:00:00.000Z"
    },
    {
        id: 9,
        name: "Stephen Hawking",
        nationality: "Britannique",
        birthDate: "1942-01-08T00:00:00.000Z",
        biography: "Physicien théoricien et cosmologiste britannique. Malgré sa maladie, il a révolutionné notre compréhension de l'univers et vulgarisé la science.",
        photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Stephen_Hawking.StarChild.jpg/220px-Stephen_Hawking.StarChild.jpg",
        dateAdded: "2024-01-23T10:00:00.000Z"
    },
    {
        id: 10,
        name: "Charles Baudelaire",
        nationality: "Française",
        birthDate: "1821-04-09T00:00:00.000Z",
        biography: "Poète français, critique d'art et traducteur. Précurseur du symbolisme, il a révolutionné la poésie moderne avec 'Les Fleurs du Mal'.",
        photoUrl: "https://tse1.mm.bing.net/th/id/OIP.N1jg7QTUgE-AAzq8EyBK5gHaHa?pid=Api&P=0&h=180",
        dateAdded: "2024-01-24T10:00:00.000Z"
    },
    {
        id: 11,
        name: "Gege Akutami",
        nationality: "Japonaise",
        birthDate: "1992-02-08T00:00:00.000Z",
        biography: "Mangaka japonais contemporain, créateur de Jujutsu Kaisen. Son style unique et ses histoires captivantes ont fait de son œuvre un phénomène mondial dans l'industrie du manga.",
        photoUrl: "https://tse1.mm.bing.net/th/id/OIP.gpiXrO2yKWVP6yodTj6hbAHaEK?pid=Api&P=0&h=180",
        dateAdded: "2024-01-25T10:00:00.000Z"
    },
    {
        id: 12,
        name: "Sun Tzu",
        nationality: "Chinoise",
        birthDate: "0544-01-01T00:00:00.000Z",
        biography: "Général, stratège et philosophe chinois du VIe siècle av. J.-C. Auteur du célèbre traité 'L'Art de la guerre', référence intemporelle en stratégie.",
        photoUrl: "https://jamesclear.com/wp-content/uploads/2016/01/sun-tzu-statue.jpg",
        dateAdded: "2024-01-26T10:00:00.000Z"
    }
];


function forceLoadSampleData() {
    localStorage.setItem('bibliotheca_books', JSON.stringify(SAMPLE_BOOKS));
    localStorage.setItem('bibliotheca_authors', JSON.stringify(SAMPLE_AUTHORS));
    console.log('Données d\'exemple forcées dans le localStorage');
    
    
    if (window.location) {
        window.location.reload();
    }
}

window.SAMPLE_BOOKS = SAMPLE_BOOKS;
window.SAMPLE_AUTHORS = SAMPLE_AUTHORS;
window.forceLoadSampleData = forceLoadSampleData;
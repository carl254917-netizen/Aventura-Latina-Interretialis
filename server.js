const express = require('express');
const path = require('path');

const app = express();
// Définit le port dynamiquement pour Render, ou utilise le port 3000 en local
const PORT = process.env.PORT || 3000;

// Indique à Express de servir tous les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Redirige toutes les requêtes vers index.html (pratique pour une Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lance le serveur
app.listen(PORT, () => {
    console.log(`Le jeu tourne avec succès. Accède à http://localhost:${PORT}`);
});
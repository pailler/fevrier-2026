const express = require('express');
const path = require('path');

const app = express();
const PORT = 8086;

// Servir la page de redirection
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'metube-redirect-temp.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur de redirection MeTube démarré sur le port ${PORT}`);
    console.log(`📺 Page de redirection: http://localhost:${PORT}`);
    console.log(`🔗 Redirige vers le serveur d'authentification sur le port 8085`);
});

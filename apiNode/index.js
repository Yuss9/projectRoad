const express = require("express");
const app = express();

// Permet de parser les requêtes JSON
app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Route pour le calcul du prix de l'électricité
app.get("/prix-electricite", (req, res) => {
  const km = parseFloat(req.headers.kilometres);
  const prix = km * 0.1; // 10 centimes par km
  res.json({ prix: prix });
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});

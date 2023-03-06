const express = require("express");
const app = express();

app.use(express.json()); // Permet de parser les requêtes JSON

app.get("/prix-electricite", (req, res) => {
  const km = parseFloat(req.get("kilometres"));
  const prix = km * 0.1;
  res.json({ prix: prix });
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});

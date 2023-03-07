const express = require("express");
const app = express();
// import express from "express";
const cors = require("cors");

//var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
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

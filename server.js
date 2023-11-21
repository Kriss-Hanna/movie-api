const express = require("express");
const fs = require("fs");
const app = express();

const PORT = 5000;
const dbMovies = "./db.json";

app.use(express.json());

// Récuperer la data
function getDatabase() {
  const data = fs.readFileSync(dbMovies);
  return JSON.parse(data);
}

// Sauvegarder la data
function saveDatabase(data) {
  fs.writeFileSync(dbMovies, JSON.stringify(data));
}

// En tant qu’utilisateur, je souhaite ajouter ...
app.post("/favorites/:userId/:movieId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const movieId = parseInt(req.params.movieId);
  const db = getDatabase();

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send("Utilisateur non trouvé");
  }

  if (!user.favorites.includes(movieId)) {
    user.favorites.push(movieId);
    saveDatabase(db);
  }

  res.status(200).send("Film ajouté aux favoris");
});

// ... et retirer un film à/de mes favoris.
app.delete("/favorites/:userId/:movieId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const movieId = parseInt(req.params.movieId);
  const db = getDatabase();

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send("Utilisateur non trouvé");
  }

  user.favorites = user.favorites.filter((id) => id !== movieId);
  saveDatabase(db);

  res.status(200).send("Film retiré des favoris");
});

// En tant qu’utilisateur, je souhaite pouvoir différencier les films que j’ai vu ...
app.post("/watched/:userId/:movieId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const movieId = parseInt(req.params.movieId);
  const db = getDatabase();

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send("Utilisateur non trouvé");
  }

  if (!user.watched.includes(movieId)) {
    user.watched.push(movieId);
    saveDatabase(db);
  }

  res.status(200).send("Film marqué comme vu");
});

// ... de ceux que je n’ai pas vu et notifier quand j’ai vu un film.
app.delete("/watched/:userId/:movieId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const movieId = parseInt(req.params.movieId);
  const db = getDatabase();

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send("Utilisateur non trouvé");
  }

  user.watched = user.watched.filter((id) => id !== movieId);
  saveDatabase(db);

  res.status(200).send("Film marqué comme non-vu");
});

// • En tant qu’utilisateur, je souhaite lister mes films favoris triés par date de sortie ou par note globale
app.get("/favorites/:userId", (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const sortBy = req.query.sortBy;

  const db = getDatabase();

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send("Utilisateur non trouvé");
  }

  const favorites = user.favorites.map((favId) =>
    db.films.find((film) => film.id === favId)
  );

  if (sortBy === "rating") {
    favorites.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "releaseDate") {
    favorites.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }

  res.status(200).json(favorites);
});

// En tant qu’utilisateur, je souhaite lister les films que j’ai vu et ceux que je n’ai pas vu.
app.get("/movies/:userId", (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const db = getDatabase();

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).send("Utilisateur non trouvé");
  }

  const watchedMovies = user.watched.map((watchId) =>
    db.films.find((film) => film.id === watchId)
  );
  const unwatchedMovies = db.films.filter(
    (film) => !user.watched.includes(film.id)
  );

  res.status(200).json({ watched: watchedMovies, unwatched: unwatchedMovies });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}. Click http://localhost:${PORT}.`
  );
});

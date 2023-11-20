const express = require('express');
const app = express();

const PORT = 5000

app.use(express.json())

app.get('/user/:userId/favorites', async (req, res) => {
  try {
    // Récupérer les données de l'utilisateur et des films
    const userResponse = await fetch(`http://localhost:5000/users/${req.params.userId}`);
    const filmsResponse = await fetch('http://localhost:5000/films');
    
    if (!userResponse.ok || !filmsResponse.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const user = await userResponse.json();
    const films = await filmsResponse.json();

    // Filtrer les films favoris de l'utilisateur
    const favorites = films.filter(film => user.favorites.includes(film.id));

    // Trier les films favoris
    const sortedFavorites = favorites.sort((a, b) => {
      if (req.query.sortBy === 'date') {
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      } else if (req.query.sortBy === 'rating') {
        return b.rating - a.rating;
      }
    });

    res.status(200).json(sortedFavorites);
  } catch (error) {
    res.status(500).send("Erreur lors de la récupération des films favoris");
  }
});

app.post('/user/:userId/favorites', async (req, res) => {
  try {
    // Récupérer les données de l'utilisateur
    const userResponse = await fetch(`http://localhost:3000/users/${req.params.userId}`);
    if (!userResponse.ok) {
      throw new Error('Utilisateur non trouvé');
    }
    const user = await userResponse.json();

    // Vérifier si le film existe
    const filmResponse = await fetch(`http://localhost:3000/films/${req.body.filmId}`);
    if (!filmResponse.ok) {
      throw new Error('Film non trouvé');
    }

    // Ajouter le film aux favoris de l'utilisateur
    const updatedFavorites = [...user.favorites, req.body.filmId];
    const updateUserResponse = await fetch(`http://localhost:3000/users/${req.params.userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites: updatedFavorites })
    });

    if (!updateUserResponse.ok) {
      throw new Error('Erreur lors de la mise à jour des favoris');
    }

    res.status(200).send('Film ajouté aux favoris');
  } catch (error) {
    res.status(500).send("Erreur lors de l'ajout du film aux favoris");
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Click http://localhost:${PORT}.`);
});

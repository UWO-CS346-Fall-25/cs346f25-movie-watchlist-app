/**
 * Movie Model
 *
 * Acts as a data store for movies in the application.
 * In a real app, this would interact with a database.
 */

// Mock data - in a real app this would come from a database
const watchlistMovies = [
  {
    id: 1,
    title: 'The Matrix',
    genre: 'sci-fi',
    desireScale: 5,
    dateAdded: '2024-01-15',
    watched: false,
  },
  {
    id: 2,
    title: 'Inception',
    genre: 'sci-fi',
    desireScale: 5,
    dateAdded: '2024-01-20',
    watched: false,
  },
  {
    id: 3,
    title: 'The Dark Knight',
    genre: 'action',
    desireScale: 5,
    dateAdded: '2024-01-25',
    watched: false,
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    genre: 'drama',
    desireScale: 4,
    dateAdded: '2024-02-01',
    watched: false,
  },
  {
    id: 5,
    title: 'The Shawshank Redemption',
    genre: 'drama',
    desireScale: 5,
    dateAdded: '2024-02-05',
    watched: false,
  },
  {
    id: 6,
    title: 'Interstellar',
    genre: 'sci-fi',
    desireScale: 4,
    dateAdded: '2024-02-10',
    watched: false,
  },
];

const watchedMovies = [
  {
    id: 101,
    title: 'Avengers: Endgame',
    genre: 'action',
    watchedDate: '2024-01-10',
    rating: 5,
    review: 'Epic conclusion to the Marvel saga. Absolutely loved it!',
  },
  {
    id: 102,
    title: 'Parasite',
    genre: 'thriller',
    watchedDate: '2024-01-18',
    rating: 5,
    review: 'Brilliant social commentary with incredible cinematography.',
  },
  {
    id: 103,
    title: 'The Grand Budapest Hotel',
    genre: 'comedy',
    watchedDate: '2024-02-02',
    rating: 4,
    review: "Wes Anderson's visual masterpiece with great humor.",
  },
];

// Methods for manipulating data
exports.getAllWatchlistMovies = () => {
  return watchlistMovies;
};

exports.getAllWatchedMovies = () => {
  return watchedMovies;
};

exports.getWatchlistMovieById = (id) => {
  return watchlistMovies.find((movie) => movie.id === parseInt(id));
};

exports.getWatchedMovieById = (id) => {
  return watchedMovies.find((movie) => movie.id === parseInt(id));
};

exports.addMovie = (movie) => {
  const newMovie = {
    id: Date.now(),
    title: movie.title,
    genre: movie.genre,
    desireScale: parseInt(movie.desireScale),
    dateAdded: new Date().toISOString().split('T')[0],
    watched: false,
  };
  watchlistMovies.push(newMovie);
  return newMovie;
};

exports.markAsWatched = (id) => {
  const movieIndex = watchlistMovies.findIndex((m) => m.id === parseInt(id));
  if (movieIndex === -1) return null;

  const movie = watchlistMovies[movieIndex];
  const watchedMovie = {
    id: Date.now(),
    title: movie.title,
    genre: movie.genre,
    watchedDate: new Date().toISOString().split('T')[0],
    rating: 0,
    review: '',
  };

  watchedMovies.push(watchedMovie);
  watchlistMovies.splice(movieIndex, 1);
  return watchedMovie;
};

exports.removeMovie = (id) => {
  const initialLength = watchlistMovies.length;
  const idNum = parseInt(id);
  const filteredMovies = watchlistMovies.filter((m) => m.id !== idNum);

  if (filteredMovies.length === initialLength) {
    return false;
  }

  watchlistMovies.length = 0;
  watchlistMovies.push(...filteredMovies);
  return true;
};

exports.updateMovieReview = (id, review, rating) => {
  const movie = watchedMovies.find((m) => m.id === parseInt(id));
  if (!movie) return false;

  if (review !== undefined) movie.review = review;
  if (rating !== undefined) movie.rating = parseInt(rating);

  return true;
};

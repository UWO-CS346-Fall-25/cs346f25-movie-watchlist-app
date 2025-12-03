/**
 * Movie Model - Supabase Version with Single Table Design
 *
 * Uses a single movies table with watched boolean instead of separate tables.
 */

const supabase = require('../config/supabase');
const loggingService = require('../services/loggingService');

// For backward compatibility, we'll keep some mock data as fallback
const fallbackWatchlistMovies = [
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
];

const fallbackWatchedMovies = [
  {
    id: 101,
    title: 'Avengers: Endgame',
    genre: 'action',
    watchedDate: '2024-01-10',
    rating: 5,
    review: 'Epic conclusion to the Marvel saga. Absolutely loved it!',
  },
];

/**
 * Get user ID for operations
 * In production, this comes from the authenticated user session
 * @param {Object} req - Express request object (contains session)
 * @returns {Promise<string>} User ID
 */
async function getUserId(req = null) {
  try {
    // If request is provided and user is logged in, use their ID
    if (req && req.session && req.session.user && req.session.user.id) {
      return req.session.user.id;
    }

    // Fallback: get the first available user from database (for testing)
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }

    if (!users || users.length === 0) {
      throw new Error('No users found in database');
    }

    return users[0].id;
  } catch (error) {
    loggingService.error('Error getting user ID', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Methods for manipulating data
exports.getAllWatchlistMovies = async (userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      console.log('No user ID available, using fallback data');
      return fallbackWatchlistMovies;
    }

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', userId)
      .eq('watched', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return fallbackWatchlistMovies;
    }

    // Transform data to match expected format
    return data.map((movie) => ({
      id: movie.id,
      title: movie.title,
      genre: movie.genre,
      desireScale: movie.desire_scale,
      dateAdded: movie.date_added,
      watched: movie.watched,
      tmdbId: movie.tmdb_id,
      posterPath: movie.poster_path,
      overview: movie.overview,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
    }));
  } catch (error) {
    console.error('Error fetching watchlist movies:', error);
    return fallbackWatchlistMovies;
  }
};

exports.getAllWatchedMovies = async (userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      console.log('No user ID available, using fallback data');
      return fallbackWatchedMovies;
    }

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', userId)
      .eq('watched', true)
      .order('watched_date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return fallbackWatchedMovies;
    }

    // Transform data to match expected format
    return data.map((movie) => ({
      id: movie.id,
      title: movie.title,
      genre: movie.genre,
      watchedDate: movie.watched_date,
      rating: movie.rating,
      review: movie.review,
      tmdbId: movie.tmdb_id,
      posterPath: movie.poster_path,
      overview: movie.overview,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
    }));
  } catch (error) {
    console.error('Error fetching watched movies:', error);
    return fallbackWatchedMovies;
  }
};

exports.getWatchlistMovieById = async (id, userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('watched', false)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      genre: data.genre,
      desireScale: data.desire_scale,
      dateAdded: data.date_added,
      watched: data.watched,
    };
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    return null;
  }
};

exports.getWatchedMovieById = async (id, userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('watched', true)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      genre: data.genre,
      watchedDate: data.watched_date,
      rating: data.rating,
      review: data.review,
    };
  } catch (error) {
    console.error('Error fetching watched movie by ID:', error);
    return null;
  }
};

exports.addMovie = async (movie, userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      console.log('No user ID available, cannot add movie');
      return null;
    }

    const movieData = {
      user_id: userId,
      title: movie.title,
      genre: movie.genre,
      desire_scale: parseInt(movie.desireScale),
      watched: false,
    };

    // Add optional TMDB fields if provided
    if (movie.tmdbId) movieData.tmdb_id = parseInt(movie.tmdbId);
    if (movie.posterPath) movieData.poster_path = movie.posterPath;
    if (movie.overview) movieData.overview = movie.overview;
    if (movie.releaseDate) movieData.release_date = movie.releaseDate;
    if (movie.voteAverage)
      movieData.vote_average = parseFloat(movie.voteAverage);

    const { data, error } = await supabase
      .from('movies')
      .insert([movieData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      genre: data.genre,
      desireScale: data.desire_scale,
      dateAdded: data.date_added,
      watched: data.watched,
      tmdbId: data.tmdb_id,
      posterPath: data.poster_path,
      overview: data.overview,
      releaseDate: data.release_date,
      voteAverage: data.vote_average,
    };
  } catch (error) {
    console.error('Error adding movie:', error);
    return null;
  }
};

exports.markAsWatched = async (id, userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      console.log('No user ID available, cannot mark movie as watched');
      return null;
    }

    // Update the movie to mark it as watched
    const { data, error } = await supabase
      .from('movies')
      .update({
        watched: true,
        watched_date: new Date().toLocaleDateString('en-CA'), // <-- FIX 1: Save local date
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('watched', false) // Only update if it's currently not watched
      .select()
      .single();

    if (error) {
      console.error('Error marking movie as watched:', error);
      return null;
    }

    if (!data) {
      console.error('Movie not found or already watched');
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      genre: data.genre,
      watchedDate: data.watched_date,
      rating: data.rating || 0,
      review: data.review || '',
    };
  } catch (error) {
    console.error('Error marking movie as watched:', error);
    return null;
  }
};

exports.removeMovie = async (id, userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      console.log('No user ID available, cannot remove movie');
      return false;
    }

    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing movie:', error);
    return false;
  }
};

exports.updateMovieReview = async (id, review, rating, userId = null) => {
  try {
    if (!userId) {
      userId = await getUserId();
    }

    if (!userId) {
      console.log('No user ID available, cannot update movie review');
      return false;
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };
    if (review !== undefined) updateData.review = review;
    if (rating !== undefined) updateData.rating = parseInt(rating);

    const { error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .eq('watched', true); // Only update watched movies

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating movie review:', error);
    return false;
  }
};

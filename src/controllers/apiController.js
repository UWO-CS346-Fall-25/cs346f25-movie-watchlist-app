/**
 * External API Controller
 *
 * Handles integration with The Movie Database (TMDB) API
 * All API calls are made server-side with proper error handling
 *
 * Note: Uses native fetch API (available in Node.js 18+)
 */

require('dotenv').config();
const fetch = require('node-fetch');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL =
  process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

/**
 * Search for movies using TMDB API
 * GET /api/search/movies?query=searchTerm
 */
exports.searchMovies = async (req, res) => {
  try {
    const { query } = req.query;

    // Validate search query
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    // Check if API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.status(500).json({
        success: false,
        error: 'TMDB API key not configured',
      });
    }

    // Build API URL
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;

    // Fetch data from TMDB API
    const response = await fetch(url);

    // Handle rate limiting or API errors
    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        });
      }
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform and return the results
    res.json({
      success: true,
      query: query,
      results: data.results || [],
      total_results: data.total_results || 0,
    });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search movies. Please try again later.',
    });
  }
};

/**
 * Get movie details by TMDB ID
 * GET /api/movies/:tmdbId
 */
exports.getMovieDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    // Validate movie ID
    if (!tmdbId || isNaN(tmdbId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid movie ID is required',
      });
    }

    // Check if API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.status(500).json({
        success: false,
        error: 'TMDB API key not configured',
      });
    }

    // Build API URL
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;

    // Fetch data from TMDB API
    const response = await fetch(url);

    // Handle not found or API errors
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          error: 'Movie not found',
        });
      }
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        });
      }
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const movieData = await response.json();

    // Return movie details
    res.json({
      success: true,
      movie: movieData,
    });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movie details. Please try again later.',
    });
  }
};

/**
 * Get popular movies from TMDB API
 * GET /api/movies/popular
 */
exports.getPopularMovies = async (req, res) => {
  try {
    // Check if API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.status(500).json({
        success: false,
        error: 'TMDB API key not configured',
      });
    }

    // Build API URL
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

    // Fetch data from TMDB API
    const response = await fetch(url);

    // Handle API errors
    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        });
      }
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Return popular movies
    res.json({
      success: true,
      results: data.results || [],
      total_results: data.total_results || 0,
    });
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular movies. Please try again later.',
    });
  }
};

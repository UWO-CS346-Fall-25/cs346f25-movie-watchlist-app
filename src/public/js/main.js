/* global localStorage, FileReader, Storage */
/**
 * Main JavaScript File
 *
 * This file contains client-side JavaScript for your application.
 * Use vanilla JavaScript (no frameworks) for DOM manipulation and interactions.
 *
 * Common tasks:
 * - Form validation
 * - Interactive UI elements
 * - AJAX requests
 * - Event handling
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Example: Form validation
  initFormValidation();

  // Example: Interactive elements
  initInteractiveElements();
});

/**
 * Initialize form validation
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });
  });
}

/**
 * Validate a form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      showError(field, 'This field is required');
      isValid = false;
    } else {
      clearError(field);
    }
  });

  return isValid;
}

/**
 * Show error message for a field
 * @param {HTMLElement} field - Form field
 * @param {string} message - Error message
 */
function showError(field, message) {
  // Remove any existing error
  clearError(field);

  // Create error element
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = message;
  error.style.color = 'red';
  error.style.fontSize = '0.875rem';
  error.style.marginTop = '0.25rem';

  // Insert after field
  field.parentNode.insertBefore(error, field.nextSibling);

  // Add error class to field
  field.classList.add('error');
  field.style.borderColor = 'red';
}

/**
 * Clear error message for a field
 * @param {HTMLElement} field - Form field
 */
function clearError(field) {
  const error = field.parentNode.querySelector('.error-message');
  if (error) {
    error.remove();
  }
  field.classList.remove('error');
  field.style.borderColor = '';
}

/**
 * Initialize interactive elements
 */
function initInteractiveElements() {
  // Example: Add smooth scrolling to anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}

/**
 * Make an AJAX request
 * @param {string} url - Request URL
 * @param {object} options - Request options (method, headers, body, etc.)
 * @returns {Promise<any>} - Response data
 */
/* eslint-disable no-unused-vars */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

/**
 * Display a notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of message (success, error, info, warning)
 */
/* eslint-disable no-unused-vars */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '20px';
  notification.style.padding = '1rem';
  notification.style.borderRadius = '4px';
  notification.style.backgroundColor =
    type === 'success'
      ? '#28a745'
      : type === 'error'
        ? '#dc3545'
        : type === 'warning'
          ? '#ffc107'
          : '#17a2b8';
  notification.style.color = 'white';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Make showNotification globally available
window.showNotification = showNotification;

// Movie Watchlist App JavaScript - Data comes from server via EJS
// Retrieve the data that was passed from the controller to the EJS template
let watchlistMovies = [];
let watchedMovies = [];

// Try to get data from the EJS-rendered page
document.addEventListener('DOMContentLoaded', function () {
  // Get watchlist data from the page (provided by controller via EJS)
  try {
    const moviesDataElement = document.getElementById('movies-data');
    if (moviesDataElement) {
      watchlistMovies = JSON.parse(moviesDataElement.textContent);
    }

    const watchedDataElement = document.getElementById('watched-data');
    if (watchedDataElement) {
      watchedMovies = JSON.parse(watchedDataElement.textContent);
    }
  } catch (error) {
    console.error('Error parsing movie data:', error);
  }
});

// DOM elements
const movieForm = document.querySelector('.movie-form');
const movieList = document.getElementById('movieList');
const filterName = document.getElementById('filterName');
const filterGenre = document.getElementById('filterGenre');
const filterDesire = document.getElementById('filterDesire');
const clearFiltersBtn = document.getElementById('clearFilters');
const clearListBtn = document.getElementById('clearList');

// Function to update watchlist count in the header
function updateWatchlistCount() {
  const movieCards = document.querySelectorAll('#movieList .movie-card');
  const count = movieCards.length;
  const headerElement = document.querySelector('.list-header h2');
  if (headerElement) {
    headerElement.textContent = `Your Watchlist (${count} movies)`;
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
});

function initializeApp() {
  if (window.location.pathname === '/') {
    initializeHome();
  } else if (window.location.pathname === '/history') {
    initializeHistory();
  } else if (window.location.pathname === '/settings') {
    initializeSettings();
  }

  // Theme handling
  initializeTheme();
}

function renderMovies(movies = []) {
  if (!movieList) return;

  if (movies.length === 0) {
    movieList.innerHTML = `
      <div class="empty-state">
        <h3>No movies in your watchlist yet!</h3>
        <p>Add your first movie above to get started.</p>
      </div>
    `;
    return;
  }

  movieList.innerHTML = movies
    .map((movie) => {
      return `
    <div class="movie-card" data-id="${movie.id}">
      <div class="movie-poster-container">
        ${
          movie.posterPath && movie.posterPath.trim() !== ''
            ? `<img
                src="https://image.tmdb.org/t/p/w300${movie.posterPath}"
                alt="${movie.title} poster"
                class="movie-poster-img"
              />`
            : `<div class="movie-poster-placeholder">
                <div class="placeholder-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                  </svg>
                </div>
                <div class="placeholder-title">${movie.title}</div>
                <div class="placeholder-subtitle">Custom Movie</div>
              </div>`
        }
      </div>
      <div class="movie-content">
        ${
          movie.overview
            ? `
        <div class="movie-overview">
          ${movie.overview.substring(0, 120)}${movie.overview.length > 120 ? '...' : ''}
        </div>
        `
            : ''
        }
        <div class="movie-header">
          <h3 class="movie-title">${movie.title}</h3>
          <span class="movie-genre">${movie.genre}</span>
        </div>
        <div class="movie-details">
          <div class="desire-scale">
            <span>Desire to watch:</span>
            <div class="stars">${'★'.repeat(movie.desireScale)}${'☆'.repeat(
              5 - movie.desireScale
            )}</div>
          </div>
          <div class="watch-date">Added: ${formatDate(movie.dateAdded)}</div>
        </div>
        <div class="movie-actions">
          <button class="btn-primary mark-watched-btn" data-movie-id="${
            movie.id
          }">Mark Watched</button>
          <button class="btn-danger remove-movie-btn" data-movie-id="${
            movie.id
          }">Remove</button>
        </div>
      </div>
    </div>
  `;
    })
    .join('');

  // Add event listeners to buttons (no inline onclick)
  document.querySelectorAll('.mark-watched-btn').forEach((btn) => {
    btn.addEventListener('click', handleMarkAsWatched);
  });

  document.querySelectorAll('.remove-movie-btn').forEach((btn) => {
    btn.addEventListener('click', handleRemoveMovie);
  });

  // Update the watchlist count in the header
  updateWatchlistCount();
}

async function handleAddMovie(e) {
  e.preventDefault();

  const titleElement = document.getElementById('movieTitle');
  const genreElement = document.getElementById('movieGenre');
  const desireScaleElement = document.getElementById('desireScale');

  const title = titleElement?.value;
  const genre = genreElement?.value;
  const desireScale = desireScaleElement?.value;

  if (!title || !genre || !desireScale) {
    console.error('Missing form values');
    showNotification('Please fill in all fields', 'error');
    return;
  }

  try {
    const response = await fetch('/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, genre, desireScale }),
    });

    const result = await response.json();

    if (result.success) {
      movieForm.reset();
      loadMovies(); // Refresh the movie list
      showNotification('Movie added successfully!', 'success');
    } else {
      console.error('Failed to add movie:', result.error);
      showNotification(result.error || 'Failed to add movie', 'error');
    }
  } catch (error) {
    console.error('Error adding movie:', error);
    showNotification('Error adding movie', 'error');
  }
}

// TMDB Search Functions
async function searchMovies() {
  const query = document.getElementById('movieSearchInput').value.trim();

  if (!query) {
    showNotification('Please enter a movie name to search', 'error');
    return;
  }

  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML =
    '<div class="loading-spinner">Searching for movies...</div>';

  try {
    const response = await fetch(
      `/api/search/movies?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (!data.success) {
      searchResults.innerHTML = `<div class="no-results"><h4>Error</h4><p>${data.error}</p></div>`;
      return;
    }

    if (data.results.length === 0) {
      searchResults.innerHTML =
        '<div class="no-results"><h4>No movies found</h4><p>Try a different search term</p></div>';
      return;
    }

    displaySearchResults(data.results);
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML =
      '<div class="no-results"><h4>Error</h4><p>Failed to search movies. Please try again.</p></div>';
  }
}

function displaySearchResults(movies) {
  const searchResults = document.getElementById('searchResults');

  searchResults.innerHTML = movies
    .map((movie) => {
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        : null;
      const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : 'N/A';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

      return `
      <div class="search-result-item" onclick="selectMovie(${movie.id})">
        ${
          posterUrl
            ? `<img src="${posterUrl}" alt="${movie.title}" class="search-result-poster" />`
            : `<div class="search-result-poster placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor" class="placeholder-search-icon">
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                </svg>
              </div>`
        }
        <div class="search-result-info">
          <div class="search-result-title">${movie.title}</div>
          <div class="search-result-meta">
            <span>📅 ${year}</span>
            <span>⭐ ${rating}</span>
          </div>
          <div class="search-result-overview">${movie.overview || 'No description available.'}</div>
        </div>
      </div>
    `;
    })
    .join('');
}

window.selectMovie = async function (tmdbId) {
  try {
    const response = await fetch(`/api/movies/tmdb/${tmdbId}`);
    const data = await response.json();

    if (!data.success) {
      showNotification('Failed to load movie details', 'error');
      return;
    }

    const movie = data.movie;

    // Store movie data in hidden fields
    document.getElementById('tmdbId').value = movie.id;
    document.getElementById('finalTitle').value = movie.title;
    document.getElementById('posterPath').value = movie.poster_path || '';
    document.getElementById('overview').value = movie.overview || '';
    document.getElementById('releaseDate').value = movie.release_date || '';
    document.getElementById('voteAverage').value = movie.vote_average || '';

    // Map TMDB genre to our genre options
    const genre = mapTMDBGenre(movie.genres);
    document.getElementById('finalGenre').value = genre;

    // Display selected movie poster
    const posterElement = document.getElementById('selectedPoster');

    if (movie.poster_path && movie.poster_path.trim() !== '') {
      const imageUrl = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
      // Set image with fallback to placeholder on error
      posterElement.outerHTML = `<img id="selectedPoster" class="selected-poster" src="${imageUrl}" alt="${movie.title} poster"
        onerror="window.showModalPlaceholder('${movie.title.replace(/'/g, "\\'")}')" />`;
    } else {
      // No poster path, use placeholder immediately
      window.showModalPlaceholder(movie.title);
    }
    document.getElementById('selectedTitle').textContent = movie.title;
    document.getElementById('selectedYear').textContent = movie.release_date
      ? `Released: ${new Date(movie.release_date).getFullYear()}`
      : '';
    document.getElementById('selectedOverview').textContent =
      movie.overview || 'No description available.';

    // Show confirm step
    showConfirmStep();
  } catch (error) {
    console.error('Error selecting movie:', error);
    showNotification('Failed to load movie details', 'error');
  }
};

// Handle modal image errors and show placeholder
window.showModalPlaceholder = function (movieTitle) {
  const posterElement = document.getElementById('selectedPoster');
  if (posterElement) {
    posterElement.outerHTML = `
      <div id="selectedPoster" class="selected-poster modal-poster-placeholder">
        <div class="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
        </div>
        <div class="placeholder-title">${movieTitle}</div>
        <div class="placeholder-subtitle">Movie Preview</div>
      </div>
    `;
  }
};

function mapTMDBGenre(genres) {
  if (!genres || genres.length === 0) return 'drama';

  const genreMap = {
    Action: 'action',
    Comedy: 'comedy',
    Drama: 'drama',
    Horror: 'horror',
    Romance: 'romance',
    'Science Fiction': 'sci-fi',
    Thriller: 'thriller',
  };

  for (const genre of genres) {
    if (genreMap[genre.name]) {
      return genreMap[genre.name];
    }
  }

  return 'drama';
}

async function handleAddMovieFromTMDB(e) {
  e.preventDefault();

  const title = document.getElementById('finalTitle').value;
  const genre = document.getElementById('finalGenre').value;
  const desireScale = document.getElementById('desireScale').value;
  const tmdbId = document.getElementById('tmdbId').value;
  const posterPath = document.getElementById('posterPath').value;
  const overview = document.getElementById('overview').value;
  const releaseDate = document.getElementById('releaseDate').value;
  const voteAverage = document.getElementById('voteAverage').value;

  if (!desireScale) {
    showNotification('Please select your desire level', 'error');
    return;
  }

  try {
    const response = await fetch('/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        genre,
        desireScale,
        tmdbId,
        posterPath,
        overview,
        releaseDate,
        voteAverage,
      }),
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('addMovieForm').style.display = 'none';
      document.getElementById('finalAddForm').reset();
      document.getElementById('movieSearchInput').value = '';
      showSearchStep();
      loadMovies();
      showNotification('Movie added to your watchlist!', 'success');
    } else {
      showNotification(result.error || 'Failed to add movie', 'error');
    }
  } catch (error) {
    console.error('Error adding movie:', error);
    showNotification('Error adding movie', 'error');
  }
}

async function handleAddMovieManual(e) {
  e.preventDefault();

  const title = document.getElementById('manualTitle').value;
  const genre = document.getElementById('manualGenre').value;
  const desireScale = document.getElementById('manualDesire').value;

  if (!title || !genre || !desireScale) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  try {
    const response = await fetch('/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, genre, desireScale }),
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('addMovieForm').style.display = 'none';
      document.getElementById('manualAddForm').reset();
      showSearchStep();
      loadMovies();
      showNotification('Movie added successfully!', 'success');
    } else {
      showNotification(result.error || 'Failed to add movie', 'error');
    }
  } catch (error) {
    console.error('Error adding movie:', error);
    showNotification('Error adding movie', 'error');
  }
}

function showSearchStep() {
  document.getElementById('searchStep').style.display = 'block';
  document.getElementById('confirmStep').style.display = 'none';
  document.getElementById('manualStep').style.display = 'none';
  document.getElementById('searchResults').innerHTML = '';
}

function showConfirmStep() {
  document.getElementById('searchStep').style.display = 'none';
  document.getElementById('confirmStep').style.display = 'block';
  document.getElementById('manualStep').style.display = 'none';
}

function showManualStep() {
  document.getElementById('searchStep').style.display = 'none';
  document.getElementById('confirmStep').style.display = 'none';
  document.getElementById('manualStep').style.display = 'block';
}

async function handleMarkAsWatched(e) {
  const movieId = e.target.getAttribute('data-movie-id');
  const movieCard = e.target.closest('.movie-card');
  const movieTitle = movieCard.querySelector('.movie-title').textContent;

  // Store the card reference globally so the submit functions can access it
  window.currentMovieCard = movieCard;

  // Show rating/review modal
  showWatchedModal(movieId, movieTitle);
}

// Show modal for rating and reviewing when marking as watched
function showWatchedModal(movieId, movieTitle) {
  // Create modal HTML
  const modalHTML = `
    <div id="watchedModal" class="modal" style="display: block;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Mark "${movieTitle}" as Watched</h3>
          <span class="close" onclick="closeWatchedModal()">&times;</span>
        </div>
        <div class="modal-body">
          <form id="watchedForm">
            <div class="form-group">
              <label for="movieRating">Rating (1-5 stars):</label>
              <div class="star-rating">
                <input type="radio" id="star5" name="rating" value="5" />
                <label for="star5" title="5 stars">★</label>
                <input type="radio" id="star4" name="rating" value="4" />
                <label for="star4" title="4 stars">★</label>
                <input type="radio" id="star3" name="rating" value="3" />
                <label for="star3" title="3 stars">★</label>
                <input type="radio" id="star2" name="rating" value="2" />
                <label for="star2" title="2 stars">★</label>
                <input type="radio" id="star1" name="rating" value="1" />
                <label for="star1" title="1 star">★</label>
              </div>
            </div>
            <div class="form-group">
              <label for="movieReview">Your Review (optional):</label>
              <textarea
                id="movieReview"
                rows="4"
                placeholder="What did you think of this movie?"
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick="closeWatchedModal()">Cancel</button>
              <button type="button" class="btn-primary" onclick="submitWatchedForm('${movieId}')">Mark as Watched</button>
              <button type="button" class="btn-outline" onclick="submitWatchedFormQuick('${movieId}')">Quick Mark (No Rating)</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('watchedModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close watched modal
function closeWatchedModal() {
  const modal = document.getElementById('watchedModal');
  if (modal) {
    modal.remove();
  }
  // Clean up the stored movie card reference
  window.currentMovieCard = null;
}

// Submit watched form with rating and review
async function submitWatchedForm(movieId) {
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const review = document.getElementById('movieReview')?.value.trim();

  if (!rating) {
    showNotification('Please select a rating', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/movies/${movieId}/watched`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: parseInt(rating),
        review: review || null,
      }),
    });

    const result = await response.json();

    if (result.success) {
      closeWatchedModal();
      // Remove the movie card from DOM immediately using stored reference
      if (window.currentMovieCard) {
        window.currentMovieCard.remove();
        window.currentMovieCard = null; // Clean up
      }
      // Update the count immediately
      updateWatchlistCount();
      loadMovies(); // Refresh the movie list
      showNotification(
        `Movie marked as watched with ${rating} star${rating > 1 ? 's' : ''}!`,
        'success'
      );
    } else {
      showNotification('Failed to mark movie as watched', 'error');
    }
  } catch (error) {
    console.error('Error marking movie as watched:', error);
    showNotification('Error updating movie', 'error');
  }
}

// Submit watched form without rating (quick mark)
async function submitWatchedFormQuick(movieId) {
  try {
    const response = await fetch(`/api/movies/${movieId}/watched`, {
      method: 'PUT',
    });

    const result = await response.json();

    if (result.success) {
      closeWatchedModal();
      // Remove the movie card from DOM immediately using stored reference
      if (window.currentMovieCard) {
        window.currentMovieCard.remove();
        window.currentMovieCard = null; // Clean up
      }
      // Update the count immediately
      updateWatchlistCount();
      loadMovies(); // Refresh the movie list
      showNotification('Movie marked as watched!', 'success');
    } else {
      showNotification('Failed to mark movie as watched', 'error');
    }
  } catch (error) {
    console.error('Error marking movie as watched:', error);
    showNotification('Error updating movie', 'error');
  }
}

async function handleRemoveMovie(e) {
  const movieId = e.target.getAttribute('data-movie-id');

  if (!confirm('Are you sure you want to remove this movie?')) return;

  try {
    const response = await fetch(`/api/movies/${movieId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      // Remove the movie card immediately from the DOM
      const movieCard = e.target.closest('.movie-card');
      if (movieCard) {
        movieCard.remove();
      }
      // Update the count immediately
      updateWatchlistCount();
      // Then refresh the full list from server
      loadMovies();
      showNotification('Movie removed successfully!', 'success');
    } else {
      showNotification('Failed to remove movie', 'error');
    }
  } catch (error) {
    console.error('Error removing movie:', error);
    showNotification('Error removing movie', 'error');
  }
}

async function loadMovies() {
  try {
    const response = await fetch('/api/movies');
    const data = await response.json();

    // Check if movieList already has content and if it matches what we're about to render
    const movieList = document.getElementById('movieList');
    if (movieList && movieList.children.length > 0) {
      // If there's already content (likely from server-side rendering),
      // only re-render if the data is significantly different
      const existingCards = movieList.querySelectorAll('.movie-card').length;
      if (existingCards === data.movies.length) {
        // Same number of movies, likely same content - don't re-render to preserve placeholders
        console.log(
          'Movies already rendered server-side, skipping client re-render'
        );
        return;
      }
    }

    renderMovies(data.movies);
  } catch (error) {
    console.error('Error loading movies:', error);
    // Don't render again here since we already rendered the sample data
    // The sample data is already showing from initializeHome()
  }
}

function initializeHome() {
  if (!document.getElementById('movieList')) return;

  // Get form elements
  const movieForm = document.querySelector('#finalAddForm');
  const manualAddForm = document.querySelector('#manualAddForm');
  const addMovieBtn = document.getElementById('addMovieBtn');
  const filterMoviesBtn = document.getElementById('filterMoviesBtn');
  const addMovieForm = document.getElementById('addMovieForm');
  const filterForm = document.getElementById('filterForm');
  const cancelAdd = document.getElementById('cancelAdd');
  const cancelManual = document.getElementById('cancelManual');
  const cancelFilter = document.getElementById('cancelFilter');
  const cancelSearch = document.getElementById('cancelSearch');

  // TMDB search elements
  const searchStep = document.getElementById('searchStep');
  const confirmStep = document.getElementById('confirmStep');
  const manualStep = document.getElementById('manualStep');
  const movieSearchInput = document.getElementById('movieSearchInput');
  const searchMovieBtn = document.getElementById('searchMovieBtn');
  const searchResults = document.getElementById('searchResults');
  const manualEntryBtn = document.getElementById('manualEntryBtn');
  const backToSearch = document.getElementById('backToSearch');
  const backToSearchFromManual = document.getElementById(
    'backToSearchFromManual'
  );

  // Form toggle functionality
  if (addMovieBtn) {
    addMovieBtn.addEventListener('click', () => {
      filterForm.style.display = 'none';
      addMovieForm.style.display =
        addMovieForm.style.display === 'none' ? 'block' : 'none';
      // Reset to search step
      if (addMovieForm.style.display === 'block') {
        showSearchStep();
      }
    });
  }

  if (filterMoviesBtn) {
    filterMoviesBtn.addEventListener('click', () => {
      addMovieForm.style.display = 'none';
      filterForm.style.display =
        filterForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (cancelAdd) {
    cancelAdd.addEventListener('click', () => {
      addMovieForm.style.display = 'none';
      if (movieForm) movieForm.reset();
      showSearchStep();
    });
  }

  if (cancelManual) {
    cancelManual.addEventListener('click', () => {
      addMovieForm.style.display = 'none';
      if (manualAddForm) manualAddForm.reset();
      showSearchStep();
    });
  }

  if (cancelSearch) {
    cancelSearch.addEventListener('click', () => {
      addMovieForm.style.display = 'none';
      movieSearchInput.value = '';
      searchResults.innerHTML = '';
      showSearchStep();
    });
  }

  if (cancelFilter) {
    cancelFilter.addEventListener('click', () => {
      filterForm.style.display = 'none';
      clearFilters();
    });
  }

  // TMDB search event listeners
  if (searchMovieBtn) {
    searchMovieBtn.addEventListener('click', searchMovies);
  }

  if (movieSearchInput) {
    movieSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchMovies();
      }
    });
  }

  if (manualEntryBtn) {
    manualEntryBtn.addEventListener('click', showManualStep);
  }

  if (backToSearch) {
    backToSearch.addEventListener('click', showSearchStep);
  }

  if (backToSearchFromManual) {
    backToSearchFromManual.addEventListener('click', showSearchStep);
  }

  // Event listeners
  if (movieForm) movieForm.addEventListener('submit', handleAddMovieFromTMDB);
  if (manualAddForm)
    manualAddForm.addEventListener('submit', handleAddMovieManual);
  if (filterName) filterName.addEventListener('input', filterMovies);
  if (filterGenre) filterGenre.addEventListener('change', filterMovies);
  if (filterDesire) filterDesire.addEventListener('change', filterMovies);
  if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
  if (clearListBtn) clearListBtn.addEventListener('click', clearAllMovies);

  // Add event listeners to existing movie cards
  addMovieCardEventListeners();
}

function addMovieCardEventListeners() {
  document.querySelectorAll('.mark-watched-btn').forEach((btn) => {
    btn.addEventListener('click', handleMarkAsWatched);
  });

  document.querySelectorAll('.remove-movie-btn').forEach((btn) => {
    btn.addEventListener('click', handleRemoveMovie);
  });

  // Load existing movies when page initializes
  loadMovies();
}

// History page functions
function initializeHistory() {
  const historyList = document.getElementById('historyList');
  const totalWatched = document.getElementById('totalWatched');
  const filterName = document.getElementById('filterName');
  const filterGenre = document.getElementById('filterGenre');
  const filterDateFrom = document.getElementById('filterDateFrom');
  const filterDateTo = document.getElementById('filterDateTo');
  const clearFiltersBtn = document.getElementById('clearFilters');

  if (!historyList) return;

  // Count watched movies from DOM
  const movieCards = historyList.querySelectorAll('.movie-card');

  if (totalWatched) {
    totalWatched.textContent = `${movieCards.length} movies watched`;
  }

  // Add event listeners for history filters
  if (filterName) filterName.addEventListener('input', filterWatchedMovies);
  if (filterGenre) filterGenre.addEventListener('change', filterWatchedMovies);
  if (filterDateFrom)
    filterDateFrom.addEventListener('change', filterWatchedMovies);
  if (filterDateTo)
    filterDateTo.addEventListener('change', filterWatchedMovies);
  if (clearFiltersBtn)
    clearFiltersBtn.addEventListener('click', clearHistoryFilters);

  // Add event listeners to edit review buttons
  document.querySelectorAll('.edit-review-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const movieId = btn.getAttribute('data-movie-id');
      editReview(movieId);
    });
  });
}

function filterWatchedMovies() {
  const nameFilter =
    document.getElementById('filterName')?.value.toLowerCase() || '';
  const genreFilter = document.getElementById('filterGenre')?.value || '';
  const dateFromFilter = document.getElementById('filterDateFrom')?.value || '';
  const dateToFilter = document.getElementById('filterDateTo')?.value || '';

  // Get movie cards from DOM
  const historyList = document.getElementById('historyList');
  const movieCards = historyList.querySelectorAll('.movie-card');
  let visibleCount = 0;

  // Filter cards based on criteria
  movieCards.forEach((card) => {
    const title = card.querySelector('.movie-title').textContent.toLowerCase();
    const genre = card.querySelector('.movie-genre').textContent.toLowerCase();
    const watchDateText = card.querySelector('.watch-date').textContent;
    // Extract date from "Watched: Mar 15, 2024" format
    const watchDate = new Date(watchDateText.replace('Watched: ', ''));

    const matchesName = title.includes(nameFilter);
    const matchesGenre =
      !genreFilter || genre.includes(genreFilter.toLowerCase());

    let matchesDateRange = true;
    if (dateFromFilter) {
      // Treat YYYY-MM-DD as local, not UTC
      const fromDate = new Date(dateFromFilter.replace(/-/g, '/'));
      matchesDateRange = matchesDateRange && watchDate >= fromDate;
    }
    if (dateToFilter) {
      // Treat YYYY-MM-DD as local, not UTC
      const toDate = new Date(dateToFilter.replace(/-/g, '/'));
      matchesDateRange = matchesDateRange && watchDate <= toDate;
    }

    if (matchesName && matchesGenre && matchesDateRange) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Handle empty state message
  let emptyState = historyList.querySelector('.empty-state');

  if (visibleCount === 0) {
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      historyList.appendChild(emptyState);
    }

    emptyState.innerHTML = `
      <h3>No movies match your filters</h3>
      <p>Try adjusting your search criteria.</p>
    `;
    emptyState.style.display = 'block';
  } else if (emptyState) {
    emptyState.style.display = 'none';
  }
}

function clearHistoryFilters() {
  const filterName = document.getElementById('filterName');
  const filterGenre = document.getElementById('filterGenre');
  const filterDateFrom = document.getElementById('filterDateFrom');
  const filterDateTo = document.getElementById('filterDateTo');

  if (filterName) filterName.value = '';
  if (filterGenre) filterGenre.value = '';
  if (filterDateFrom) filterDateFrom.value = '';
  if (filterDateTo) filterDateTo.value = '';

  // Show all movie cards
  const historyList = document.getElementById('historyList');
  const movieCards = historyList.querySelectorAll('.movie-card');

  movieCards.forEach((card) => {
    card.style.display = '';
  });

  // Hide any empty state message
  const emptyState = historyList.querySelector('.empty-state');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
}

function filterMovies() {
  const nameFilter = filterName?.value.toLowerCase() || '';
  const genreFilter = filterGenre?.value || '';
  const desireFilter = filterDesire?.value || '';

  // Get movie cards from DOM
  const movieCards = movieList.querySelectorAll('.movie-card');
  let visibleCount = 0;

  movieCards.forEach((card) => {
    const title = card.querySelector('.movie-title').textContent.toLowerCase();
    const genre = card.querySelector('.movie-genre').textContent.toLowerCase();
    const stars = card.querySelector('.stars').textContent;
    const desireScale = (stars.match(/★/g) || []).length;

    const matchesName = title.includes(nameFilter);
    const matchesGenre =
      !genreFilter || genre.includes(genreFilter.toLowerCase());
    const matchesDesire =
      !desireFilter || desireScale === parseInt(desireFilter);

    if (matchesName && matchesGenre && matchesDesire) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Handle empty state message
  let emptyState = movieList.querySelector('.empty-state');

  if (visibleCount === 0 && movieCards.length > 0) {
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      movieList.appendChild(emptyState);
    }

    emptyState.innerHTML = `
      <h3>No movies match your filters</h3>
      <p>Try adjusting your search criteria.</p>
    `;
    emptyState.style.display = 'block';
  } else if (emptyState) {
    emptyState.style.display = 'none';
  }
}

function clearFilters() {
  if (filterName) filterName.value = '';
  if (filterGenre) filterGenre.value = '';
  if (filterDesire) filterDesire.value = '';

  // Show all movie cards
  const movieCards = movieList.querySelectorAll('.movie-card');
  movieCards.forEach((card) => {
    card.style.display = '';
  });

  // Hide any empty state message
  const emptyState = movieList.querySelector('.empty-state');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
}

function editReview(id) {
  // Get the movie card element by id
  const card = document.querySelector(`.movie-card[data-id="${id}"]`);
  if (!card) return;

  // Get current values from the DOM
  const currentReview =
    card.querySelector('.movie-review')?.textContent.replace('Review: ', '') ||
    '';
  const currentRating =
    (card.querySelector('.stars')?.textContent.match(/★/g) || []).length || 0;

  // Show modal or use prompt for simplicity
  const newReview = prompt('Edit your review:', currentReview);
  const newRating = prompt('Edit your rating (1-5):', currentRating);

  if (newReview !== null) {
    // Update review in the DOM
    let reviewElement = card.querySelector('.movie-review');
    if (!reviewElement) {
      reviewElement = document.createElement('div');
      reviewElement.className = 'movie-review';
      card.querySelector('.movie-details').appendChild(reviewElement);
    }
    reviewElement.innerHTML = `<strong>Review:</strong> ${newReview}`;
  }

  if (
    newRating !== null &&
    parseInt(newRating) >= 1 &&
    parseInt(newRating) <= 5
  ) {
    // Update stars in the DOM
    const starsElement = card.querySelector('.stars');
    if (starsElement) {
      const rating = parseInt(newRating);
      starsElement.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }
  }
}

// Settings page functions
function initializeSettings() {
  const themeInputs = document.querySelectorAll('input[name="theme"]');
  const uploadAvatar = document.getElementById('uploadAvatar');
  const avatarInput = document.getElementById('avatarInput');
  const emailForm = document.getElementById('emailForm');
  const passwordForm = document.getElementById('passwordForm');
  const clearAllDataBtn = document.getElementById('clearAllData');
  const deleteAccountBtn = document.getElementById('deleteAccount');

  if (themeInputs) {
    themeInputs.forEach((input) => {
      input.addEventListener('change', handleThemeChange);
    });
  }

  if (uploadAvatar && avatarInput) {
    uploadAvatar.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', handleAvatarUpload);
  }

  if (emailForm) {
    emailForm.addEventListener('submit', handleEmailUpdate);
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordUpdate);
  }

  if (clearAllDataBtn) {
    clearAllDataBtn.addEventListener('click', handleClearAllData);
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', handleDeleteAccount);
  }
}

// Handle theme change
function handleThemeChange(e) {
  const theme = e.target.value;
  document.documentElement.setAttribute('data-theme', theme);

  // Store theme preference if localStorage is available
  if (typeof Storage !== 'undefined') {
    localStorage.setItem('theme', theme);
  }

  showNotification(`Theme changed to ${theme}`, 'success');
}

// Handle avatar upload
function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Check if FileReader API is available
  if (typeof FileReader === 'undefined') {
    showNotification('File upload not supported in your browser', 'error');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showNotification('Please select an image file', 'error');
    return;
  }

  // Read and display the file
  const reader = new FileReader();
  reader.onload = function (e) {
    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg) {
      avatarImg.src = e.target.result;
      showNotification('Avatar updated successfully', 'success');
    }
  };
  reader.onerror = function () {
    showNotification('Error reading file', 'error');
  };
  reader.readAsDataURL(file);
}

// Handle email update
async function handleEmailUpdate(e) {
  e.preventDefault();

  const emailInput = document.getElementById('email');
  // 1. Get the CSRF token from the hidden input field
  const csrfToken = document.querySelector('input[name="_csrf"]').value;

  const newEmail = emailInput.value.trim();

  if (!newEmail) {
    showNotification('Email is required', 'error');
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  try {
    const response = await fetch('/users/update-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(newEmail)}&_csrf=${encodeURIComponent(csrfToken)}`,
    });

    const result = await response.json();

    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error || 'Failed to update email', 'error');
    }
  } catch (error) {
    console.error('Error updating email:', error);
    showNotification('Error updating email', 'error');
  }
}

// Handle password update
async function handlePasswordUpdate(e) {
  e.preventDefault();

  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  // 1. Get the CSRF token here too
  const csrfToken = document.querySelector('input[name="_csrf"]').value;

  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!newPassword || !confirmPassword) {
    showNotification('Both password fields are required', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showNotification('Password must be at least 6 characters long', 'error');
    return;
  }

  try {
    const response = await fetch('/users/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 2. Include the token in the headers
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        password: newPassword,
        confirmPassword: confirmPassword,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Clear the form on success
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error || 'Failed to update password', 'error');
    }
  } catch (error) {
    console.error('Error updating password:', error);
    showNotification('Error updating password', 'error');
  }
}

// Theme initialization
function initializeTheme() {
  let savedTheme = 'light';

  // Check if localStorage is available
  if (typeof Storage !== 'undefined') {
    savedTheme = localStorage.getItem('theme') || 'light';
  }

  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeInput = document.querySelector(
    `input[name="theme"][value="${savedTheme}"]`
  );
  if (themeInput) themeInput.checked = true;
}

// Clear all movies from watchlist
function clearAllMovies() {
  if (
    confirm('Are you sure you want to clear all movies from your watchlist?')
  ) {
    // In a real app, this would make an API call to clear server data
    try {
      // Clear DOM representation
      if (movieList) {
        movieList.innerHTML = `
          <div class="empty-state">
            <h3>No movies in your watchlist yet!</h3>
            <p>Add your first movie above to get started.</p>
          </div>
        `;
      }
      // Update the watchlist count
      updateWatchlistCount();
      showNotification('Watchlist cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing movies:', error);
      showNotification('Error clearing watchlist', 'error');
    }
  }
}

// Handle clear all watchlist data
async function handleClearAllData(e) {
  e.preventDefault();
  
  const confirmed = confirm(
    'Are you sure you want to clear ALL your watchlist data? This action cannot be undone.'
  );
  
  if (!confirmed) return;

  try {
    const csrfToken = document.querySelector('input[name="_csrf"]')?.value || '';
    console.log('CSRF Token found:', csrfToken); // Debug log
    
    if (!csrfToken) {
      showNotification('Security token not found. Please refresh the page.', 'error');
      return;
    }
    
    // Use URLSearchParams to properly handle CSRF token (like form submission)
    /* eslint-disable no-undef */
    const params = new URLSearchParams();
    params.append('_csrf', csrfToken);
    /* eslint-enable no-undef */
    
    const response = await fetch('/users/clear-watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();

    if (data.success) {
      showNotification(data.message, 'success');
      // Refresh the page or redirect to home after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      showNotification(data.error || 'Failed to clear watchlist data', 'error');
    }
  } catch (error) {
    console.error('Error clearing watchlist data:', error);
    showNotification('An error occurred while clearing watchlist data', 'error');
  }
}

// Handle delete account
async function handleDeleteAccount(e) {
  e.preventDefault();
  
  const confirmed = confirm(
    'Are you sure you want to DELETE YOUR ACCOUNT? This will permanently delete all your data and cannot be undone.'
  );
  
  if (!confirmed) return;

  // Double confirmation for account deletion
  const doubleConfirmed = confirm(
    'This is your final warning. Are you absolutely sure you want to delete your account? All your data will be lost forever.'
  );
  
  if (!doubleConfirmed) return;

  try {
    const csrfToken = document.querySelector('input[name="_csrf"]')?.value || '';
    console.log('CSRF Token found:', csrfToken); // Debug log
    
    if (!csrfToken) {
      showNotification('Security token not found. Please refresh the page.', 'error');
      return;
    }
    
    // Use URLSearchParams to properly handle CSRF token (like form submission)
    /* eslint-disable no-undef */
    const params = new URLSearchParams();
    params.append('_csrf', csrfToken);
    /* eslint-enable no-undef */
    
    const response = await fetch('/users/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();

    if (data.success) {
      showNotification(data.message, 'success');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = data.redirect || '/users/login';
      }, 2000);
    } else {
      showNotification(data.error || 'Failed to delete account', 'error');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    showNotification('An error occurred while deleting account', 'error');
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC', // <-- Fixes "Added" date
  });
}

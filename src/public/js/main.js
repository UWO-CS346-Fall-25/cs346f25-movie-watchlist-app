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
  console.log('Application initialized');

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
    .map(
      (movie) => `
    <div class="movie-card" data-id="${movie.id}">
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
  `
    )
    .join('');

  // Add event listeners to buttons (no inline onclick)
  document.querySelectorAll('.mark-watched-btn').forEach((btn) => {
    btn.addEventListener('click', handleMarkAsWatched);
  });

  document.querySelectorAll('.remove-movie-btn').forEach((btn) => {
    btn.addEventListener('click', handleRemoveMovie);
  });
}

async function handleAddMovie(e) {
  e.preventDefault();

  const titleElement = document.getElementById('movieTitle');
  const genreElement = document.getElementById('movieGenre');
  const desireScaleElement = document.getElementById('desireScale');

  console.log('Form elements found:', {
    titleElement,
    genreElement,
    desireScaleElement,
  });

  const title = titleElement?.value;
  const genre = genreElement?.value;
  const desireScale = desireScaleElement?.value;

  console.log('Form values:', { title, genre, desireScale });

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

    console.log('Add movie response:', result);

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

async function handleMarkAsWatched(e) {
  const movieId = e.target.getAttribute('data-movie-id');
  const movieCard = e.target.closest('.movie-card');
  const movieTitle = movieCard.querySelector('.movie-title').textContent;

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
      loadMovies(); // Refresh the movie list
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
  const movieForm = document.querySelector('#addMovieForm .movie-form');
  const addMovieBtn = document.getElementById('addMovieBtn');
  const filterMoviesBtn = document.getElementById('filterMoviesBtn');
  const addMovieForm = document.getElementById('addMovieForm');
  const filterForm = document.getElementById('filterForm');
  const cancelAdd = document.getElementById('cancelAdd');
  const cancelFilter = document.getElementById('cancelFilter');

  // Form toggle functionality
  if (addMovieBtn) {
    addMovieBtn.addEventListener('click', () => {
      filterForm.style.display = 'none';
      addMovieForm.style.display =
        addMovieForm.style.display === 'none' ? 'block' : 'none';
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
    });
  }

  if (cancelFilter) {
    cancelFilter.addEventListener('click', () => {
      filterForm.style.display = 'none';
      clearFilters();
    });
  }

  // Event listeners
  if (movieForm) movieForm.addEventListener('submit', handleAddMovie);
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newEmail }),
    });

    const result = await response.json();

    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
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
      },
      body: JSON.stringify({
        password: newPassword,
        confirmPassword: confirmPassword,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Clear the form
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
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
      showNotification('Watchlist cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing movies:', error);
      showNotification('Error clearing watchlist', 'error');
    }
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

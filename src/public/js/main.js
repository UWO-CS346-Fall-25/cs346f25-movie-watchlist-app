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
  notification.style.right = '20px';
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

// Movie Watchlist App JavaScript

// Sample data for demonstration
let watchlistMovies = [
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

let watchedMovies = [
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

function initializeHome() {
  if (!movieForm) return;

  // Event listeners
  movieForm.addEventListener('submit', handleAddMovie);
  if (filterName) filterName.addEventListener('input', filterMovies);
  if (filterGenre) filterGenre.addEventListener('change', filterMovies);
  if (filterDesire) filterDesire.addEventListener('change', filterMovies);
  if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
  if (clearListBtn) clearListBtn.addEventListener('click', clearAllMovies);

  // Initial render
  renderMovies();
}

function handleAddMovie(e) {
  e.preventDefault();

  const title = document.getElementById('movieTitle').value;
  const genre = document.getElementById('movieGenre').value;
  const desireScale = document.getElementById('desireScale').value;

  if (!title || !genre || !desireScale) return;

  const newMovie = {
    id: Date.now(),
    title,
    genre,
    desireScale: parseInt(desireScale),
    dateAdded: new Date().toISOString().split('T')[0],
    watched: false,
  };

  watchlistMovies.push(newMovie);
  renderMovies();
  movieForm.reset();
}

function renderMovies() {
  if (!movieList) return;

  if (watchlistMovies.length === 0) {
    movieList.innerHTML = `
      <div class="empty-state">
        <h3>No movies in your watchlist yet!</h3>
        <p>Add your first movie above to get started.</p>
      </div>
    `;
    return;
  }

  movieList.innerHTML = watchlistMovies
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
          <div class="stars">${'★'.repeat(movie.desireScale)}${'☆'.repeat(5 - movie.desireScale)}</div>
        </div>
        <div class="watch-date">Added: ${formatDate(movie.dateAdded)}</div>
      </div>
      <div class="movie-actions">
        <button onclick="markAsWatched(${movie.id})" class="btn-primary">Mark Watched</button>
        <button onclick="removeMovie(${movie.id})" class="btn-danger">Remove</button>
      </div>
    </div>
  `
    )
    .join('');
}

function markAsWatched(id) {
  const movie = watchlistMovies.find((m) => m.id === id);
  if (!movie) return;

  // Move to watched list
  const watchedMovie = {
    ...movie,
    id: Date.now() + Math.random(),
    watchedDate: new Date().toISOString().split('T')[0],
    rating: 0,
    review: '',
  };

  watchedMovies.push(watchedMovie);
  watchlistMovies = watchlistMovies.filter((m) => m.id !== id);
  renderMovies();
}

function removeMovie(id) {
  watchlistMovies = watchlistMovies.filter((m) => m.id !== id);
  renderMovies();
}

function filterMovies() {
  const nameFilter = filterName?.value.toLowerCase() || '';
  const genreFilter = filterGenre?.value || '';
  const desireFilter = filterDesire?.value || '';

  const filtered = watchlistMovies.filter((movie) => {
    const matchesName = movie.title.toLowerCase().includes(nameFilter);
    const matchesGenre = !genreFilter || movie.genre === genreFilter;
    const matchesDesire =
      !desireFilter || movie.desireScale.toString() === desireFilter;

    return matchesName && matchesGenre && matchesDesire;
  });

  renderFilteredMovies(filtered);
}

function renderFilteredMovies(movies) {
  if (!movieList) return;

  if (movies.length === 0) {
    movieList.innerHTML = `
      <div class="empty-state">
        <h3>No movies match your filters</h3>
        <p>Try adjusting your search criteria.</p>
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
          <div class="stars">${'★'.repeat(movie.desireScale)}${'☆'.repeat(5 - movie.desireScale)}</div>
        </div>
        <div class="watch-date">Added: ${formatDate(movie.dateAdded)}</div>
      </div>
      <div class="movie-actions">
        <button onclick="markAsWatched(${movie.id})" class="btn-primary">Mark Watched</button>
        <button onclick="removeMovie(${movie.id})" class="btn-danger">Remove</button>
      </div>
    </div>
  `
    )
    .join('');
}

function clearFilters() {
  if (filterName) filterName.value = '';
  if (filterGenre) filterGenre.value = '';
  if (filterDesire) filterDesire.value = '';
  renderMovies();
}

function clearAllMovies() {
  if (
    confirm('Are you sure you want to clear all movies from your watchlist?')
  ) {
    watchlistMovies = [];
    renderMovies();
  }
}

// History page functions
function initializeHistory() {
  const historyList = document.getElementById('historyList');
  const totalWatched = document.getElementById('totalWatched');

  if (!historyList) return;

  if (totalWatched) {
    totalWatched.textContent = `${watchedMovies.length} movies watched`;
  }

  renderWatchedMovies();
}

function renderWatchedMovies() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  if (watchedMovies.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <h3>No movies watched yet!</h3>
        <p>Mark movies as watched from your <a href="/">watchlist</a> to see them here.</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = watchedMovies
    .map(
      (movie) => `
    <div class="movie-card" data-id="${movie.id}">
      <div class="movie-header">
        <h3 class="movie-title">${movie.title}</h3>
        <span class="movie-genre">${movie.genre}</span>
      </div>
      <div class="movie-details">
        <div class="movie-rating">
          <span>Rating:</span>
          <div class="stars">${'★'.repeat(movie.rating)}${'☆'.repeat(5 - movie.rating)}</div>
        </div>
        <div class="watch-date">Watched: ${formatDate(movie.watchedDate)}</div>
        ${movie.review ? `<div class="movie-review"><strong>Review:</strong> ${movie.review}</div>` : ''}
      </div>
      <div class="movie-actions">
        <button onclick="editReview(${movie.id})" class="btn-secondary">Edit Review</button>
      </div>
    </div>
  `
    )
    .join('');
}

function editReview(id) {
  // This would open a modal in a real app
  const movie = watchedMovies.find((m) => m.id === id);
  if (!movie) return;

  const newReview = prompt('Edit your review:', movie.review);
  const newRating = prompt('Edit your rating (1-5):', movie.rating);

  if (newReview !== null) movie.review = newReview;
  if (newRating !== null && newRating >= 1 && newRating <= 5) {
    movie.rating = parseInt(newRating);
  }

  renderWatchedMovies();
}

// Settings page functions
function initializeSettings() {
  const themeInputs = document.querySelectorAll('input[name="theme"]');
  const uploadAvatar = document.getElementById('uploadAvatar');
  const avatarInput = document.getElementById('avatarInput');

  themeInputs.forEach((input) => {
    input.addEventListener('change', handleThemeChange);
  });

  if (uploadAvatar && avatarInput) {
    uploadAvatar.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', handleAvatarUpload);
  }
}

function handleThemeChange(e) {
  const theme = e.target.value;
  document.documentElement.setAttribute('data-theme', theme);

  // Check if localStorage is available
  if (typeof Storage !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (file) {
    // Check if FileReader is available
    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.onload = function (e) {
        const avatar = document.getElementById('profileAvatar');
        if (avatar) avatar.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      console.error('FileReader not supported in this browser');
    }
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

// Utility functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

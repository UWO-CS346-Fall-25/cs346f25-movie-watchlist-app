/**
 * History Page JavaScript
 * Handles watched movie management, filtering, and review editing
 */

let historyWatchedMovies = [];
let historyFilteredMovies = [];

// DOM elements
const historyListEl = document.getElementById('historyList');
const totalWatchedSpanEl = document.getElementById('totalWatched');
const filterNameInputEl = document.getElementById('filterName');
const filterGenreSelectEl = document.getElementById('filterGenre');
const filterDateFromInputEl = document.getElementById('filterDateFrom');
const filterDateToInputEl = document.getElementById('filterDateTo');
const clearFiltersBtnEl = document.getElementById('clearFilters');
const reviewModalEl = document.getElementById('reviewModal');
const reviewFormEl = document.getElementById('reviewForm');
const reviewTextAreaEl = document.getElementById('reviewText');
const ratingSelectEl = document.getElementById('rating');
const cancelReviewBtnEl = document.getElementById('cancelReview');

let currentEditingMovieId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
  setupEventListeners();
  attachButtonListeners();
  loadWatchedMovies();
});

// Attach event listeners to buttons (for server-rendered content)
function attachButtonListeners() {
  document.querySelectorAll('.remove-watched-btn').forEach((btn) => {
    btn.addEventListener('click', handleRemoveWatched);
  });

  document.querySelectorAll('.edit-review-btn').forEach((btn) => {
    btn.addEventListener('click', handleEditReview);
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Filter inputs
  filterNameInputEl.addEventListener('input', applyFilters);
  filterGenreSelectEl.addEventListener('change', applyFilters);
  filterDateFromInputEl.addEventListener('change', applyFilters);
  filterDateToInputEl.addEventListener('change', applyFilters);
  clearFiltersBtnEl.addEventListener('click', clearFilters);

  // Modal handlers
  const closeBtn = reviewModalEl.querySelector('.close');
  closeBtn.addEventListener('click', closeReviewModal);
  cancelReviewBtnEl.addEventListener('click', closeReviewModal);
  reviewFormEl.addEventListener('submit', handleReviewSubmit);

  // Click outside modal to close
  reviewModalEl.addEventListener('click', function (e) {
    if (e.target === reviewModalEl) {
      closeReviewModal();
    }
  });
}

// Load watched movies from server
async function loadWatchedMovies() {
  try {
    const response = await fetch('/api/watched');
    const result = await response.json();

    if (result.success) {
      historyWatchedMovies = result.movies;
      historyFilteredMovies = [...historyWatchedMovies];
      renderMovies();
      updateStats();
    } else {
      showNotification('Failed to load watched movies', 'error');
    }
  } catch {
    showNotification('Error loading movies', 'error');
  }
}

// Render movies to the page
function renderMovies() {
  if (historyFilteredMovies.length === 0) {
    historyListEl.innerHTML = `
      <div class="empty-state">
        <h3>No movies found</h3>
        <p>Try adjusting your filters or <a href="/">add some movies to your watchlist</a>.</p>
      </div>
    `;
    return;
  }

  historyListEl.innerHTML = historyFilteredMovies
    .map(
      (movie) => `
    <div class="movie-card" data-id="${movie.id}">
      <div class="movie-header">
        <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
        <span class="movie-genre">${escapeHtml(movie.genre)}</span>
      </div>
      <div class="movie-details">
        <div class="movie-rating">
          <span>Rating:</span>
          <div class="stars">
            ${generateStars(movie.rating)}
          </div>
        </div>
        <div class="watch-date">
          Watched: ${new Date(movie.watchedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
        ${movie.review ? `<div class="movie-review"><strong>Review:</strong> ${escapeHtml(movie.review)}</div>` : ''}
      </div>
      <div class="movie-actions">
        <button class="btn-secondary edit-review-btn" data-movie-id="${movie.id}">
          Edit Review
        </button>
        <button class="btn-danger remove-watched-btn" data-movie-id="${movie.id}">
          Remove
        </button>
      </div>
    </div>
  `
    )
    .join('');

  // Add event listeners to action buttons
  attachButtonListeners();
}

// Generate star rating HTML
function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? '★' : '☆';
  }
  return stars;
}

// Update statistics
function updateStats() {
  totalWatchedSpanEl.textContent = `${historyFilteredMovies.length} movie${historyFilteredMovies.length !== 1 ? 's' : ''} watched`;
}

// Apply filters to movie list
function applyFilters() {
  const nameFilter = filterNameInputEl.value.toLowerCase().trim();
  const genreFilter = filterGenreSelectEl.value.toLowerCase();
  const dateFromFilter = filterDateFromInputEl.value;
  const dateToFilter = filterDateToInputEl.value;

  historyFilteredMovies = historyWatchedMovies.filter((movie) => {
    // Name filter
    if (nameFilter && !movie.title.toLowerCase().includes(nameFilter)) {
      return false;
    }

    // Genre filter
    if (genreFilter && movie.genre.toLowerCase() !== genreFilter) {
      return false;
    }

    // Date filters
    const movieDate = new Date(movie.watchedDate);
    if (dateFromFilter && movieDate < new Date(dateFromFilter)) {
      return false;
    }
    if (dateToFilter && movieDate > new Date(dateToFilter)) {
      return false;
    }

    return true;
  });

  renderMovies();
  updateStats();
}

// Clear all filters
function clearFilters() {
  filterNameInputEl.value = '';
  filterGenreSelectEl.value = '';
  filterDateFromInputEl.value = '';
  filterDateToInputEl.value = '';

  historyFilteredMovies = [...historyWatchedMovies];
  renderMovies();
  updateStats();
}

// Handle edit review button click
function handleEditReview(e) {
  const movieId = e.target.getAttribute('data-movie-id');
  const movie = historyWatchedMovies.find((m) => m.id == movieId);

  if (!movie) {
    showNotification('Movie not found', 'error');
    return;
  }

  currentEditingMovieId = movieId;
  reviewTextAreaEl.value = movie.review || '';
  ratingSelectEl.value = movie.rating || '1';

  reviewModalEl.style.display = 'block';
}

// Handle remove watched button click
async function handleRemoveWatched(e) {
  try {
    const movieId = e.target.getAttribute('data-movie-id');

    const shouldRemove = await showConfirmationModal(
      'Remove Movie',
      `Are you sure you want to remove this movie from your history?`,
      'Remove',
      'danger'
    );

    if (!shouldRemove) return;

    const response = await fetch(`/api/movies/${movieId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      loadWatchedMovies();
      showNotification('Movie removed successfully!', 'success');
    } else {
      showNotification('Failed to remove movie', 'error');
    }
  } catch {
    showNotification('Error removing movie', 'error');
  }
}

// Close review modal
function closeReviewModal() {
  reviewModalEl.style.display = 'none';
  currentEditingMovieId = null;
  reviewFormEl.reset();
}

// Handle review form submission
async function handleReviewSubmit(e) {
  e.preventDefault();

  if (!currentEditingMovieId) {
    showNotification('No movie selected for editing', 'error');
    return;
  }

  const review = reviewTextAreaEl.value.trim();
  const rating = parseInt(ratingSelectEl.value);

  if (!rating || rating < 1 || rating > 5) {
    showNotification('Please select a valid rating', 'error');
    return;
  }

  try {
    const response = await fetch(
      `/api/watched/${currentEditingMovieId}/review`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, review: review || null }),
      }
    );

    const result = await response.json();

    if (result.success) {
      // Update local movie data
      const movieIndex = historyWatchedMovies.findIndex(
        (m) => m.id == currentEditingMovieId
      );
      if (movieIndex !== -1) {
        historyWatchedMovies[movieIndex].rating = rating;
        historyWatchedMovies[movieIndex].review = review || null;
      }

      // Update filtered movies
      const filteredIndex = historyFilteredMovies.findIndex(
        (m) => m.id == currentEditingMovieId
      );
      if (filteredIndex !== -1) {
        historyFilteredMovies[filteredIndex].rating = rating;
        historyFilteredMovies[filteredIndex].review = review || null;
      }

      closeReviewModal();
      renderMovies();
      showNotification('Review updated successfully', 'success');
    } else {
      showNotification('Failed to update review', 'error');
    }
  } catch {
    showNotification('Error updating review', 'error');
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show notification (uses function from main.js)
function showNotification(message, type = 'info') {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    // Fallback if main.js notification function isn't available
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  }
}

// Show professional confirmation modal
function showConfirmationModal(
  title,
  message,
  confirmText = 'Confirm',
  type = 'primary'
) {
  return new Promise((resolve) => {
    // Create modal HTML
    const modalHTML = `
      <div id="confirmationModal" class="modal" style="display: block;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${escapeHtml(title)}</h3>
          </div>
          <div class="modal-body">
            <p>${escapeHtml(message)}</p>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" id="confirmCancel">Cancel</button>
            <button type="button" class="btn-${type}" id="confirmOk">${escapeHtml(confirmText)}</button>
          </div>
        </div>
      </div>
    `;

    // Remove existing confirmation modal if any
    const existingModal = document.getElementById('confirmationModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('confirmationModal');
    const cancelBtn = document.getElementById('confirmCancel');
    const okBtn = document.getElementById('confirmOk');

    // Handle button clicks
    const cleanup = () => {
      modal.remove();
    };

    cancelBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    okBtn.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });

    // Handle click outside modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
        resolve(false);
      }
    });

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        document.removeEventListener('keydown', handleEscape);
        resolve(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}

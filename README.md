# Movie Watchlist Application

A full-stack web application that allows users to track movies they want to watch and have already watched, with comprehensive logging for monitoring and debugging.

## Features

- 🎬 **Movie Management** - Add, remove, and track movies you want to watch
- ⭐ **Ratings & Reviews** - Rate and review movies you've watched
- 🔍 **Movie Search** - Integration with TMDB API for real-time movie search
- 🔍 **Powerful Filtering** - Find movies by name, genre, rating, or date
- 🌓 **Theme Switching** - Toggle between light and dark mode
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔒 **User Authentication** - Secure login and registration with Supabase Auth
- ☁️ **Cloud Database** - Real-time data storage with Supabase
- 📊 **Comprehensive Logging** - Application monitoring with Winston and Morgan

## Logging System (Deliverable 7)

### Overview

The application implements a comprehensive logging system using Winston and Morgan for application monitoring, debugging, and security auditing.

## Changelog

**\*Logging:** Implemented a standardized logging system using a custom `loggingService`. Every controller now tracks actions, inputs, and database results.

**\*Error Handling:** Refactored all external API and Database calls to use `try/catch` blocks. The app now renders a user-friendly error page instead of crashing on 500 errors.

**\*Documentation:** Added JSDoc comments to all controllers detailing Inputs, Outputs, and Purpose. Updated README to include architectural overview.

**\*Resilience:** Added validation checks for External API responses (TMDB) to handle rate limiting and downtime gracefully.

### Components

**Winston Logger (`src/config/logger.js`)**

- Multi-transport logging (file + console)
- JSON formatting for structured logs
- Log rotation with file size limits
- Multiple log levels (error, warn, info, http, debug)
- Separate files for different log types

**Morgan HTTP Logger (`src/middleware/httpLogger.js`)**

- HTTP request/response logging
- Custom tokens for user-id and session-id
- Colored output for development
- Integration with Winston logger stream

**Centralized Logging Service (`src/services/loggingService.js`)**

- Specialized methods for different application areas:
  - Authentication events
  - Database operations
  - API calls
  - Security events
  - Performance monitoring
  - Session lifecycle

### Log Files Structure

```text
logs/
├── combined.log     # All log levels combined
├── error.log        # Error-level logs only
├── http.log         # HTTP request logs
├── exceptions.log   # Unhandled exceptions
└── rejections.log   # Unhandled promise rejections
```

### Integration Points

- **Application Lifecycle**: Server startup/shutdown, graceful shutdown handling
- **HTTP Middleware**: All incoming requests logged with response times and status codes
- **Authentication Flow**: Login/logout attempts, session creation/destruction
- **Database Operations**: CRUD operations with user context and timing
- **Error Handling**: Structured error logging with stack traces and context
- **Security Events**: Failed authentication attempts, unauthorized access

### Log Format Example

```json
{
  "timestamp": "2025-12-03 17:44:31:4431",
  "level": "info",
  "message": "User login successful",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "sessionId": "sess_abc123",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

### Technical Architecture (Deliverable 7)

This project follows the **Model-View-Controller (MVC)** architectural pattern. This ensures a clean separation between data management, user interface, and business logic.

### MVC Components

**\*Models (`src/models/`):** Responsible for all direct database interactions. We use `movieModel.js` to execute SQL queries via Supabase, ensuring the database logic is isolated from the rest of the app.

**\*Views (`src/views/`):** Responsible for the UI. We use EJS templates to render dynamic HTML pages. Views receive data from Controllers but never interact with the database directly.

**\*Controllers (`src/controllers/`):** The "brain" of the application. They receive the user's request, validate inputs, ask the Model for data, and decide which View to render.

### Request Flow Example

1. **Route:** A user visits `/movies`. The route handler in `routes/index.js` directs this to the `movieController`.
2. **Controller:** `movieController.getMovies` is triggered. It checks the session to identify the user.
3. **Model:** The controller calls `movieModel.getAllWatchlistMovies(userId)`. The model executes the SQL query and returns the data.
4. **View:** The controller passes this data to `res.render('index', { movies })`, which generates the HTML sent to the browser.

## External API Integration

### TMDB (The Movie Database) API

- **Base URL:** `https://api.themoviedb.org/3`
- **Endpoints:** Search movies, popular movies, movie details
- **Security:** API key stored in environment variables
- **Routes:**
  - `GET /search` - Movie search page
  - `GET /api/search/movies` - Search API endpoint
  - `GET /api/movies/popular` - Popular movies endpoint

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js with Express
- **Templating:** EJS for dynamic page rendering
- **Database:** Supabase (PostgreSQL) with Authentication
- **Security:** Helmet, CSRF protection, secure sessions
- **Logging:** Winston (structured logging), Morgan (HTTP logging)
- **External API:** TMDB (The Movie Database) API

## Project Structure

```text
├── src/
│   ├── server.js              # Server entry point with logging
│   ├── app.js                 # Express app configuration
│   ├── config/                # Configuration files
│   │   ├── supabase.js        # Supabase client setup
│   │   └── logger.js          # Winston logger configuration
│   ├── middleware/            # Express middleware
│   │   └── httpLogger.js      # Morgan HTTP logging middleware
│   ├── services/              # Business logic services
│   │   ├── authService.js     # Supabase Auth integration
│   │   └── loggingService.js  # Centralized logging service
│   ├── routes/                # Route definitions
│   │   ├── index.js           # Main route handlers
│   │   ├── api.js             # API routes
│   │   └── users.js           # Authentication routes
│   ├── controllers/           # Request handlers with logging
│   │   ├── homeController.js  # Home page controller
│   │   ├── movieController.js # Movie operations
│   │   └── userController.js  # User authentication
│   ├── models/                # Data models with logging
│   │   └── movieModel.js      # Movie database operations
│   ├── views/                 # EJS templates
│   │   ├── index.ejs          # Home page (watchlist)
│   │   ├── history.ejs        # Movie history page
│   │   ├── settings.ejs       # User settings page
│   │   ├── login.ejs          # Login page
│   │   ├── register.ejs       # Registration page
│   │   └── layout.ejs         # Main layout template
│   └── public/                # Static files
│       ├── css/style.css      # Main stylesheet
│       └── js/main.js         # Client-side JavaScript
├── logs/                      # Log files (auto-created)
│   ├── combined.log          # All logs
│   ├── error.log             # Error logs only
│   ├── http.log              # HTTP request logs
│   ├── exceptions.log        # Unhandled exceptions
│   └── rejections.log        # Promise rejections
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/UWO-CS346-Fall-25/cs346f25-movie-watchlist-app.git
   cd cs346f25-movie-watchlist-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Start the application**

   ```bash
   npm run dev    # Development server with auto-reload
   npm start    # Production server
   ```

5. **View logs**

   Logs are automatically created in the `logs/` directory:
   - `combined.log` - All application logs
   - `error.log` - Error-level logs only
   - `http.log` - HTTP request/response logs

6. **Open your browser**

   Navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run lint` - Check code for linting errors
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run reset` - Reset database (migrate + seed)

## Database Schema

The app uses Supabase PostgreSQL with a single `movies` table:

```sql
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  desire_scale INTEGER CHECK (desire_scale >= 1 AND desire_scale <= 5),
  date_added DATE DEFAULT CURRENT_DATE,
  watched BOOLEAN DEFAULT FALSE,
  watched_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  tmdb_id INTEGER,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key

# Session Configuration
SESSION_SECRET=your_random_session_secret

# Application Configuration
NODE_ENV=development
PORT=3000
```

## Development Features

- **Hot Reload**: Automatic server restart with nodemon in development
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Error Handling**: Comprehensive error logging and graceful error pages
- **Security**: CSRF protection, secure headers, session management
- **Database**: Automated migrations and seeding for easy setup

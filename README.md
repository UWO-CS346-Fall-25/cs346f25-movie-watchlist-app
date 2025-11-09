# Movie Watchlist Application

A web application that allows users to track movies they want to watch and have already watched, providing a seamless way to manage your movie-watching experience.

## Pages and Features

### feature/week10 improvements

This deliverable integrates a Supabase PostgreSQL database. The primary CRUD (Create/Read) slice implemented is **User Authentication**.

**\*Create:** Users can register via the `/register` page. This form posts to the `userController`, which uses `supabase.auth.signUp()` to `INSERT` a new user into the Supabase `auth.users` table.
**\*Read:** Users can log in via the `/login` page. This form posts to the `userController`, which uses `supabase.auth.signInWithPassword()` to query (or `SELECT`) the `auth.users` table to authenticate the user and create a session.

The screenshots for the table schemas are in the docs/ folder.

We are currently sharing a database with our learn_french application from Mobile App Development.

## (Preview) Row-Level Security (RLS)

Once auth is fully implemented, we would secure the `movies` table by enabling Row-Level Security (RLS). We would add a `user_id` column (a foreign key to `auth.users.id`) to the `movies` table. Then, we would create an RLS policy that states a user can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` movies where the `movies.user_id` column matches their own `auth.uid()`. This would ensure that users can only see and manage their own movie watchlist.

### feature/week9 improvements

Some of the requirements were hit in the previous deliverable. In addition to this, we implemented the login and registration form page. We changed the font, and made filter inputs hidden but expandable.
We have several hover over effects throughout the app and all pages are responsive to screen size.

### Home Page

**Purpose:** Main landing page for users to view and manage their movie watchlist.

**What's Visible:**

- Navigation bar with links to Home, History, and Settings pages
- A hero section with the app title and description
- Movie addition form with fields for title, genre, and desire-to-watch scale
- Filtering options (by name, genre, desire level)
- Grid display of unwatched movies with:
  - Movie title and genre
  - Desire-to-watch rating (1-5 stars)
  - Options to mark as watched or remove from list
- Empty state display when no movies are added

![alt text](homepage.png)

![alt text](homepage.png)

### History Page

**Purpose:** Shows all movies that have been watched, along with user ratings and reviews.

**What's Visible:**

- Complete watched movie history
- Filtering options (by name, genre, watch date)
- For each movie:
  - Title and genre
  - User rating (1-5 stars)
  - Date watched
  - User's review
  - Option to edit review and rating
- Statistics showing total movies watched
  ![alt text](historypage.png)

### Settings Page

**Purpose:** Allows users to customize their profile and application preferences.

**What's Visible:**

- Profile settings section:
  - Profile picture upload
  - Username and email fields
- Password management:
  - Change password form
- Theme selection:
  - Light/dark mode toggle
- Account actions:
  - Clear watchlist data
  - Delete account options

![alt text](settingspage.png)

![alt text](settingspage.png)

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js with Express
- **Templating:** EJS for dynamic page rendering
- **Database:** Supabase (PostgreSQL) with Authentication
- **Security:** Helmet, CSRF protection, secure sessions

## Project Structure

```
├── src/
│   ├── server.js           # Server entry point
│   ├── app.js              # Express app configuration
│   ├── config/             # Configuration files
│   │   └── supabase.js     # Supabase client setup
│   ├── services/           # Business logic services
│   │   └── authService.js  # Supabase Auth integration
│   ├── routes/             # Route definitions
│   │   ├── index.js        # Main route handlers
│   │   ├── api.js          # API routes
│   │   └── users.js        # Authentication routes
│   ├── controllers/        # Request handlers
│   │   ├── homeController.js    # Home page controller
│   │   ├── movieController.js   # Movie operations
│   │   └── userController.js    # User authentication
│   ├── models/             # Data models
│   │   └── movieModel.js   # Movie database operations
│   ├── views/              # EJS templates
│   │   ├── index.ejs       # Home page (watchlist)
│   │   ├── history.ejs     # Movie history page
│   │   ├── settings.ejs    # User settings page
│   │   ├── login.ejs       # Login page
│   │   ├── register.ejs    # Registration page
│   │   ├── error.ejs       # Error page
│   │   └── layout.ejs      # Main layout template
│   └── public/             # Static files
│       ├── css/            # Stylesheets
│       │   └── style.css   # Main stylesheet
│       ├── js/             # Client-side JavaScript
│       │   ├── main.js     # Main JavaScript file
│       │   ├── history.js  # History page functionality
│       │   └── settings.js # Settings page functionality
│       └── images/         # Image assets
│           └── default-avatar.png # Default user avatar
├── supabase-setup.sql      # Database setup script
├── test-supabase.js        # Test database connection
├── test-auth.js            # Test authentication
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## Features

- 🎬 **Movie Management** - Add, remove, and track movies you want to watch
- ⭐ **Ratings & Reviews** - Rate and review movies you've watched
- 🔍 **Powerful Filtering** - Find movies by name, genre, rating, or date
- 🌓 **Theme Switching** - Toggle between light and dark mode
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔒 **User Authentication** - Secure login and registration with Supabase Auth
- ☁️ **Cloud Database** - Real-time data storage with Supabase

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

3. **Set up Supabase database**

   Copy the contents of `supabase-setup.sql` to your Supabase SQL Editor and run it to create the movies table and sample data.

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials (URL and API key are already configured)
   ```

5. **Test the connection**

   ```bash
   node test-supabase.js
   ```

6. **Start the application**

   ```bash
   npm run dev
   ```

7. **Open your browser**

   ```bash
   http://localhost:3000
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `node test-supabase.js` - Test Supabase database connection
- `node test-auth.js` - Test Supabase authentication setup
- `npm run lint` - Check code for linting errors
- `npm run format` - Format code with Prettier

## Database Schema

The app uses a single `movies` table for both watchlist and watched movies:

```sql
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  desire_scale INTEGER CHECK (desire_scale >= 1 AND desire_scale <= 5),
  date_added DATE DEFAULT CURRENT_DATE,
  watched BOOLEAN DEFAULT FALSE,
  watched_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Design Benefits:**

- Simple single-table approach (no complex JOINs)
- `watched = false` for watchlist movies
- `watched = true` for watched movies
- Works with existing Supabase Auth users table

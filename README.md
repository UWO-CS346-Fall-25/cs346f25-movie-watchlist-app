# CS346 Semester Project Template

A teaching template for building secure web applications with Node.js, Express, EJS, and PostgreSQL.

## Features

- 🚀 **Node.js 20** + **Express 4** - Modern JavaScript backend
- 🎨 **EJS** - Server-side templating
- 🗄️ **PostgreSQL** - Reliable relational database
- 🔒 **Security First** - Helmet, CSRF protection, secure sessions
- 📝 **Clean Code** - ESLint, Prettier, best practices
- 🎓 **Educational** - Well-documented, instructional code

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd cs346-semester-project-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database**

   ```bash
   # Create database (adjust credentials as needed)
   createdb your_database_name
   ```

5. **Run migrations**

   ```bash
   npm run migrate
   ```

6. **Seed database (optional)**

   ```bash
   npm run seed
   ```

7. **Start the application**

   ```bash
   npm run dev
   ```

8. **Open your browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
├── src/
│   ├── server.js           # Server entry point
│   ├── app.js              # Express app configuration
│   ├── routes/             # Route definitions
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── views/              # EJS templates
│   └── public/             # Static files (CSS, JS, images)
├── db/
│   ├── migrations/         # Database migrations
│   ├── seeds/              # Database seeds
│   ├── migrate.js          # Migration runner
│   ├── seed.js             # Seed runner
│   └── reset.js            # Database reset script
├── docs/                   # Documentation
│   ├── README.md           # Documentation overview
│   ├── SETUP.md            # Setup guide
│   └── ARCHITECTURE.md     # Architecture details
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
└── package.json            # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run reset` - Reset database (WARNING: deletes all data!)
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier

## Security Features

- **Helmet**: Sets security-related HTTP headers
- **express-session**: Secure session management with httpOnly cookies
- **csurf**: Cross-Site Request Forgery (CSRF) protection
- **Parameterized SQL**: SQL injection prevention with prepared statements
- **Environment Variables**: Sensitive data kept out of source code

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- [docs/README.md](docs/README.md) - Documentation overview
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup instructions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture and design patterns

## Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Templating**: EJS
- **Database**: PostgreSQL (with pg driver)
- **Security**: Helmet, express-session, csurf
- **Development**: ESLint, Prettier, Nodemon

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [OWASP Security Guide](https://owasp.org/)

## Contributing

This is a teaching template. Feel free to:

- Report issues
- Suggest improvements
- Submit pull requests
- Use it for your own projects

## License

ISC

# Movie Watchlist Application

A web application that allows users to track movies they want to watch and have already watched, providing a seamless way to manage your movie-watching experience.

## Pages and Features

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

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js with Express
- **Templating:** EJS for dynamic page rendering
- **Database:** PostgreSQL for data storage
- **Security:** Helmet, CSRF protection, secure sessions

## Project Structure

```
├── src/
│   ├── server.js           # Server entry point
│   ├── app.js              # Express app configuration
│   ├── routes/             # Route definitions
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── views/              # EJS templates
│   │   ├── index.ejs       # Home page
│   │   ├── history.ejs     # History page
│   │   ├── settings.ejs    # Settings page
│   │   └── error.ejs       # Error page
│   └── public/             # Static files
│       ├── css/            # Stylesheets
│       ├── js/             # Client-side JavaScript
│       └── images/         # Image assets
├── db/
│   ├── migrations/         # Database migrations
│   └── seeds/              # Database seeds
└── package.json            # Dependencies and scripts
```

## Features

- 🎬 **Movie Management** - Add, remove, and track movies you want to watch
- ⭐ **Ratings & Reviews** - Rate and review movies you've watched
- 🔍 **Powerful Filtering** - Find movies by name, genre, rating, or date
- 🌓 **Theme Switching** - Toggle between light and dark mode
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔒 **User Authentication** - Secure login and registration

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd cs346f25-movie-watchlist-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database**

   ```bash
   # Create database
   createdb movie_watchlist
   ```

5. **Run migrations**

   ```bash
   npm run migrate
   ```

6. **Start the application**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run lint` - Check code for linting errors
- `npm run format` - Format code with Prettier

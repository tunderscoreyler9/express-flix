# TMDB Movie Search App

A web application built with Express.js and the TMDB API that allows users to search for movies and view their details.

## Features

- Search for movies using TMDB's extensive database
- View movie details including:
  - Title
  - Release date
  - Overview
  - Movie poster
- Responsive design for mobile and desktop viewing
- Modern UI with loading states and smooth transitions

## Technologies Used

- Express.js
- EJS (Embedded JavaScript templates)
- Tailwind CSS
- TMDB API
- Node.js

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your TMDB API key:
```env
TMDB_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

## Getting a TMDB API Key

To use this application, you'll need a TMDB API key:

1. Visit [TMDB Website](https://www.themoviedb.org/)
2. Create an account
3. Go to Settings -> API
4. Register for an API key
5. Copy the API key to your `.env` file

## Project Structure

```
tmdb-express-app/
├── public/
│   └── js/
│       ├── movieNavigation.js
│       └── search.js
├── views/
│   ├── partials/
│   │   └── navbar.ejs
│   ├── layout.ejs
│   ├── index.ejs
│   └── movie-details.ejs
├── app.js
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [Tailwind CSS](https://tailwindcss.com/) for the styling utilities
- [Express.js](https://expressjs.com/) for the web framework
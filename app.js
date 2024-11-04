const express = require('express');
const axios = require('axios');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up EJS layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage and search functionality
app.get('/', async (req, res) => {
    const query = req.query.query;
    
    try {
        if (query) {
            // Search functionality remains the same
            const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`;
            const response = await axios.get(searchUrl);
            res.render('index', { 
                query, 
                results: response.data.results || [],
                trending: [],
                topRated: []
            });
        } else {
            // Fetch trending movies
            const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`;
            const trendingResponse = await axios.get(trendingUrl);

            // Fetch top rated movies
            const topRatedUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}&page=1`;
            const topRatedResponse = await axios.get(topRatedUrl);

            res.render('index', { 
                query: '', 
                results: [],
                trending: trendingResponse.data.results.slice(0, 8), // Show top 8 trending
                topRated: topRatedResponse.data.results.slice(0, 8)  // Show top 8 rated
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.render('index', { 
            query: query || '', 
            results: [],
            trending: [],
            topRated: [],
            error: "An error occurred while fetching movies." 
        });
    }
});

// New route for movie details
app.get('/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        // Get the search query from the referrer or query parameter
        const searchQuery = req.query.from || '';
        
        // Fetch basic movie details
        const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`;
        const movieResponse = await axios.get(movieUrl);
        
        // Fetch cast and crew
        const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`;
        const creditsResponse = await axios.get(creditsUrl);
        
        // Fetch similar movies
        const similarUrl = `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${process.env.TMDB_API_KEY}`;
        const similarResponse = await axios.get(similarUrl);

        const movieData = {
            ...movieResponse.data,
            credits: creditsResponse.data,
            similar: similarResponse.data.results.slice(0, 4)
        };

        res.render('movie-details', { 
            movie: movieData,
            searchQuery // Pass the search query to the template
        });
    } catch (error) {
        console.error("Error fetching movie details:", error);
        res.status(404).render('error', { 
            message: "Movie not found or error occurred" 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
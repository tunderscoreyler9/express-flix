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
                topRated: [],
                upcoming: [],
                nowPlaying: []
            });
        } else {
            // Fetch all movie categories in parallel for better performance
            const [trendingResponse, topRatedResponse, upcomingResponse, nowPlayingResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`),
                axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}&page=1`),
                axios.get(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_API_KEY}`),
                axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}`)
            ]);

            res.render('index', { 
                query: '', 
                results: [],
                trending: trendingResponse.data.results.slice(0, 6),     // Show top 6 trending
                topRated: topRatedResponse.data.results.slice(0, 6),     // Show top 6 rated
                upcoming: upcomingResponse.data.results.slice(0, 6),     // Show top 6 upcoming
                nowPlaying: nowPlayingResponse.data.results.slice(0, 6)  // Show top 6 now playing
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.render('index', { 
            query: query || '', 
            results: [],
            trending: [],
            topRated: [],
            upcoming: [],
            nowPlaying: [],
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

// New route for actor details
app.get('/actor/:id', async (req, res) => {
    try {
        const actorId = req.params.id;
        
        // Fetch actor details
        const actorUrl = `https://api.themoviedb.org/3/person/${actorId}?api_key=${process.env.TMDB_API_KEY}`;
        const actorResponse = await axios.get(actorUrl);
        
        // Fetch actor credits
        const creditsUrl = `https://api.themoviedb.org/3/person/${actorId}/combined_credits?api_key=${process.env.TMDB_API_KEY}`;
        const creditsResponse = await axios.get(creditsUrl);

        res.render('actor-details', { 
            actor: actorResponse.data,
            credits: creditsResponse.data.cast.slice(0, 6)
        });
    } catch (error) {
        console.error("Error fetching actor details:", error);
        res.status(404).render('error', { 
            message: "Actor not found or error occurred" 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
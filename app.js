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
    const searchType = req.query.query || 'movie'; // Default to movie search (opposed to 'actor').
    
    try {
        if (query) {
            // Choose appropriate endpoint based on search type
            let searchUrl;
            if (searchType === 'actor') {
                searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${process.env.TMDB_API_KEY}&query=${query}`;
            } else {
                searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`;
            }

            const response = await axios.get(searchUrl);
            res.render('index', { 
                query, 
                searchType,
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
                searchType: 'movie',
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
            searchType: searchType || 'movie',
            results: [],
            trending: [],
            topRated: [],
            upcoming: [],
            nowPlaying: [],
            error: "An error occurred while fetching data." 
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

// Route for actor details
app.get('/actor/:id', async (req, res) => {
    try {
        const actorId = req.params.id;
        // Get the search query from the referrer or the query paramter itself
        const searchQuery = req.query.from || '';

        // Fetch actor data in parallel for best performance:
        const [actorResponse, creditsResponse, imagesResponse] = await Promise.all([
            // Actor's actor details
            axios.get(`https://api.themoviedb.org/3/person/${actorId}?api_key=${process.env.TMDB_API_KEY}`),

            // Actor's movie credits
            axios.get(`https://api.themoviedb.org/3/person/${actorId}/combined_credits?api_key=${process.env.TMDB_API_KEY}`),

            // Actor's images
            axios.get(`https://api.themoviedb.org/3/person/${actorId}/images?api_key=${process.env.TMDB_API_KEY}`)
        ]);

        // Combine all data for easy access in the template:
        const actorData = {
            ...actorResponse.data,
            credits: creditsResponse.data,
            images: imagesResponse.data,
            // Calculate the actor's age if their bday is posted
            age: actorResponse.data.birthday ? calculateAge(new Date(actorResponse.data/birthday)) : null
        };

        // Categorise movies by popularity, with the most popular first:
        actorData.credits.cast = actorData.credits.cast.sort((a, b) =>
            b.popularity - a.popularity
        );

        res.render('actor-details', {
            actor: actorData,
            searchQuery, // Pass the query to the ejs template
            title: `${actorData.name} - Actor Details`
        });

    } catch (error) {
        console.error("Error fethcing actor details:", error);
        res.status(404).render('error', {
            message: "Actor not found or error occurred",
            title: "Error"
        });
    }
});






// Helper function to calculate age
function calculateAge(birthday) {
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
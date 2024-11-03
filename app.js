const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage and search functionality
app.get('/', async (req, res) => {
    const query = req.query.query;

    if (query) {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`;
        try {
            const response = await axios.get(url);
            const results = response.data.results || [];
            res.render('index', { query, results });
        } catch (error) {
            console.error("Error fetching data:", error);
            res.render('index', { query, results: [], error: "An error occurred during search." });
        }
    } else {
        res.render('index', { query: '', results: [] });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
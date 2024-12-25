// tests/integration/api.test.js

const request = require('supertest');
const express = require('express');
const path = require('path');

// Create a test version of your app
const app = express();

// Set up the same middleware and settings as your main app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// Mock the TMDB API responses
const mockTMDBResponse = {
    results: [
        {
            id: 1,
            title: 'Test Movie',
            release_date: '2024-01-01',
            overview: 'Test overview'
        }
    ]
};

// Mock route for testing
app.get('/', (req, res) => {
    if (req.query.query) {
        // Search results page
        res.render('index', { 
            query: req.query.query, 
            results: mockTMDBResponse.results,
            trending: [],
            topRated: [],
            upcoming: [],
            nowPlaying: []
        });
    } else {
        // Home page
        res.render('index', { 
            query: '', 
            results: [],
            trending: mockTMDBResponse.results,
            topRated: mockTMDBResponse.results,
            upcoming: mockTMDBResponse.results,
            nowPlaying: mockTMDBResponse.results
        });
    }
});

describe('API Endpoints', () => {
    test('GET / should return homepage HTML', async () => {
        const response = await request(app)
            .get('/')
            .expect('Content-Type', /html/)
            .expect(200);
            
        // Check for specific sections we expect on the homepage
        expect(response.text).toContain('Now Playing');
        expect(response.text).toContain('Trending This Week');
        expect(response.text).toContain('Coming Soon');
    });

    test('GET /?query=test should return search results', async () => {
        const response = await request(app)
            .get('/?query=test')
            .expect('Content-Type', /html/)
            .expect(200);
            
        // Check for search results content
        expect(response.text).toContain('Test Movie');
    });
});

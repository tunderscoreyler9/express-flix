// DOM Elements
const searchForm = document.getElementById('searchForm');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const searchButton = document.getElementById('searchButton');

// Event Listeners
searchForm.addEventListener('submit', handleSearch);

// Handler Functions
function handleSearch(e) {
    showLoadingState();
};

// UI State Functions
function showLoadingState() {
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    disableSearchButton();
};

function disableSearchButton() {
    searchButton.disabled = true;
    searchButton.classList.add('opacity-75');
};
/**
 * DOM Elements used throughout the search functionality
 * @type {HTMLElement}
 */
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const searchButton = document.getElementById('searchButton');

// Event Listeners
searchForm.addEventListener('submit', handleSearch);
window.addEventListener('popstate', handleHistoryNavigation);

/**
 * Initializes the search input value from URL parameters on page load
 * This ensures the search input reflects the current URL state
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = new URL(window.location.href);
    const searchTerm = currentUrl.searchParams.get('query');
    if (searchTerm) {
        searchInput.value = searchTerm;
    }
});

/**
 * Handles the search form submission and performs the search operation
 * Updates the URL, fetches search results, and updates the page content
 * @param {Event} e - The submit event object
 * @returns {Promise<void>}
 */
async function handleSearch(e) {
    if (e) {
        e.preventDefault();
    }
    
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        return;
    }
    showLoadingState();
    
    try {
        // Update URL with search term
        const searchUrl = new URL(window.location.href);
        searchUrl.searchParams.set('query', searchTerm);
        
        // Only update history if this wasn't triggered by popstate
        if (e && e.type === 'submit') {
            window.history.pushState({ searchTerm }, '', searchUrl);
        }
        
        // Fetch search results
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            throw new Error('Search request failed');
        }
        
        // Update page content
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Update results section
        const newResultsSection = doc.getElementById('resultsSection');
        if (newResultsSection) {
            resultsSection.innerHTML = newResultsSection.innerHTML;
        } else {
            throw new Error('Could not find results section in response');
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showErrorMessage('An error occurred while searching. Please try again.');
    } finally {
        hideLoadingState();
    }
}

/**
 * Handles browser back/forward navigation events
 * Updates the search input and results based on the URL state
 * @param {PopStateEvent} event - The popstate event object
 */
function handleHistoryNavigation(event) {
    const currentUrl = new URL(window.location.href);
    const searchTerm = currentUrl.searchParams.get('query');
    
    // Update search input
    searchInput.value = searchTerm || '';
    
    if (searchTerm) {
        // Perform search with term from URL
        handleSearch();
    } else {
        // Return to homepage state
        resetToHomepage();
    }
}

/**
 * Resets the page to its homepage state
 * Fetches the homepage content and updates the results section
 */
function resetToHomepage() {
    showLoadingState();
    
    fetch('/')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newResultsSection = doc.getElementById('resultsSection');
            if (newResultsSection) {
                resultsSection.innerHTML = newResultsSection.innerHTML;
            }
        })
        .catch(error => {
            console.error('Error returning to homepage:', error);
            showErrorMessage('An error occurred. Please refresh the page.');
        })
        .finally(() => {
            hideLoadingState();
        });
}

/**
 * Shows the loading state UI
 * Displays the loading spinner and disables the search button
 */
function showLoadingState() {
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('opacity-50');
    disableSearchButton();
}

/**
 * Hides the loading state UI
 * Removes the loading spinner and enables the search button
 */
function hideLoadingState() {
    loadingState.classList.add('hidden');
    resultsSection.classList.remove('opacity-50');
    enableSearchButton();
}

/**
 * Disables the search button and adds visual feedback
 */
function disableSearchButton() {
    searchButton.disabled = true;
    searchButton.classList.add('opacity-75');
}

/**
 * Enables the search button and removes visual feedback
 */
function enableSearchButton() {
    searchButton.disabled = false;
    searchButton.classList.remove('opacity-75');
}

/**
 * Displays an error message to the user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    resultsSection.innerHTML = `
        <div class="text-center py-12">
            <p class="text-lg text-red-600">${message}</p>
        </div>
    `;
}
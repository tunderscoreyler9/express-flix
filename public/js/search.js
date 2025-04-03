// Search functionality with proper error handling and loading states
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const searchButton = document.getElementById('searchButton');

// Event Listeners
searchForm.addEventListener('submit', handleSearch);
window.addEventListener('popstate', handleHistoryNavigation);

// Initialize search input from URL if present
document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = new URL(window.location.href);
    const searchTerm = currentUrl.searchParams.get('query');
    if (searchTerm) {
        searchInput.value = searchTerm;
    }
});


/**
 * Handles the search form submission event
 * Prevents default form behavior, processes search term, and fetches results
 * Updates UI to show loading state and results, and manages browser history
 * 
 * @param {Event} e - The form submission event object (can be null if called programmatically)
 * @returns {Promise<void>}
 */
async function handleSearch(e) {
    if (e) {
        e.preventDefault();
    }
    
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showErrorMessage('Please enter a search term');
        return;
    }

    showLoadingState();
    
    try {
        // Check if we're on the movie details page
        const isMovieDetailsPage = window.location.pathname.startsWith('/movie/');
        
        // Create the search URL
        const searchUrl = new URL('/', window.location.origin);
        searchUrl.searchParams.set('query', searchTerm);

        if (isMovieDetailsPage) {
            // If on movie details, redirect to home with search query
            window.location.href = searchUrl.toString();
            return;
        }
        
        // Only update history if this wasn't triggered by popstate
        if (e && e.type === 'submit') {
            window.history.pushState({ searchTerm }, '', searchUrl);
        }
        
        // Fetch search results with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(searchUrl, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Search failed with status: ${response.status}`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const newResultsSection = doc.getElementById('resultsSection');
        if (newResultsSection) {
            resultsSection.innerHTML = newResultsSection.innerHTML;
        } else {
            throw new Error('Could not find results section in response');
        }
        
    } catch (error) {
        console.error('Search error:', error);
        if (error.name === 'AbortError') {
            showErrorMessage('Search timed out. Please try again.');
        } else {
            showErrorMessage('An error occurred while searching. Please try again.');
        }
    } finally {
        hideLoadingState();
    }
}


/**
 * Displays an error message to the user in a dismissible notification
 * Creates a temporary notification that automatically disappears after 5 seconds
 * 
 * @param {string} message - The error message to display to the user
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
    errorDiv.innerHTML = `
        <span class="block sm:inline">${message}</span>
        <button class="absolute top-0 bottom-0 right-0 px-4 py-3" onclick="this.parentElement.remove()">
            <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.414l-2.93 2.93a1 1 0 01-1.414-1.414l2.93-2.93-2.93-2.93a1 1 0 011.414-1.414l2.93 2.93 2.93-2.93a1 1 0 011.414 1.414l-2.93 2.93 2.93 2.93a1 1 0 010 1.414z"/>
            </svg>
        </button>
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}


/**
 * Shows the loading state UI elements
 * Makes the loading indicator visible, reduces opacity of results section,
 * and disables the search button to prevent multiple submissions
 */
function showLoadingState() {
    if (loadingState) {
        loadingState.classList.remove('hidden');
    }
    if (resultsSection) {
        resultsSection.classList.add('opacity-50');
    }
    disableSearchButton();
}


/**
 * Hides the loading state UI elements
 * Hides the loading indicator, restores normal opacity to results section,
 * and re-enables the search button
 */
function hideLoadingState() {
    if (loadingState) {
        loadingState.classList.add('hidden');
    }
    if (resultsSection) {
        resultsSection.classList.remove('opacity-50');
    }
    enableSearchButton();
}


/**
 * Disables the search button to prevent multiple submissions
 * Adds opacity to provide visual feedback that the button is disabled
 */
function disableSearchButton() {
    if (searchButton) {
        searchButton.disabled = true;
        searchButton.classList.add('opacity-75');
    }
}


/**
 * Re-enables the search button after search operation completes
 * Removes opacity to indicate button is clickable again
 */
function enableSearchButton() {
    if (searchButton) {
        searchButton.disabled = false;
        searchButton.classList.remove('opacity-75');
    }
}


/**
 * Re-enables the search button after search operation completes
 * Removes opacity to indicate button is clickable again
 */
function handleHistoryNavigation(event) {
    const currentUrl = new URL(window.location.href);
    const searchTerm = currentUrl.searchParams.get('query');
    
    searchInput.value = searchTerm || '';
    
    if (searchTerm) {
        handleSearch();
    } else {
        resetToHomepage();
    }
}


/**
 * Resets the page to homepage state showing default content
 * Fetches homepage content and updates the results section
 * Shows loading state during the transition
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
};
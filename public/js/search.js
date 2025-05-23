// Search functionality with proper error handling and loading states
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchTypeSelect = document.querySelector('select[name="searchType"]');
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
    const searchType = currentUrl.searchParams.get('searchType');
    
    if (searchTerm) {
        searchInput.value = searchTerm;
    }
    
    if (searchType && searchTypeSelect) {
        searchTypeSelect.value = searchType;
    }
});

async function handleSearch(e) {
    if (e) {
        e.preventDefault();
    }
    
    const searchTerm = searchInput.value.trim();
    const searchType = searchTypeSelect ? searchTypeSelect.value : 'movie';
    
    if (!searchTerm) {
        showErrorMessage('Please enter a search term');
        return;
    }

    showLoadingState();
    
    try {
        // Check if we're on the movie or actor details page
        const isDetailsPage = window.location.pathname.startsWith('/movie/') || 
                              window.location.pathname.startsWith('/actor/');
        
        // Create the search URL
        const searchUrl = new URL('/', window.location.origin);
        searchUrl.searchParams.set('query', searchTerm);
        searchUrl.searchParams.set('searchType', searchType);

        if (isDetailsPage) {
            // If on details page, redirect to home with search query
            window.location.href = searchUrl.toString();
            return;
        }
        
        // Only update history if this wasn't triggered by popstate
        if (e && e.type === 'submit') {
            window.history.pushState({ searchTerm, searchType }, '', searchUrl);
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

function showLoadingState() {
    if (loadingState) {
        loadingState.classList.remove('hidden');
    }
    if (resultsSection) {
        resultsSection.classList.add('opacity-50');
    }
    disableSearchButton();
}

function hideLoadingState() {
    if (loadingState) {
        loadingState.classList.add('hidden');
    }
    if (resultsSection) {
        resultsSection.classList.remove('opacity-50');
    }
    enableSearchButton();
}

function disableSearchButton() {
    if (searchButton) {
        searchButton.disabled = true;
        searchButton.classList.add('opacity-75');
    }
}

function enableSearchButton() {
    if (searchButton) {
        searchButton.disabled = false;
        searchButton.classList.remove('opacity-75');
    }
}

// Handle browser back/forward navigation
function handleHistoryNavigation(event) {
    const currentUrl = new URL(window.location.href);
    const searchTerm = currentUrl.searchParams.get('query');
    const searchType = currentUrl.searchParams.get('searchType');
    
    searchInput.value = searchTerm || '';
    
    if (searchTypeSelect && searchType) {
        searchTypeSelect.value = searchType;
    }
    
    if (searchTerm) {
        handleSearch();
    } else {
        resetToHomepage();
    }
}

// Reset to homepage state
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
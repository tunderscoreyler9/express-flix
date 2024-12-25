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
        // Update URL with search term
        const searchUrl = new URL(window.location.href);
        searchUrl.searchParams.set('query', searchTerm);
        
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
    setTimeout(() => errorDiv.remove(), 5000); // Remove after 5 seconds
}

function showLoadingState() {
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('opacity-50');
    disableSearchButton();
}

function hideLoadingState() {
    loadingState.classList.add('hidden');
    resultsSection.classList.remove('opacity-50');
    enableSearchButton();
}

function disableSearchButton() {
    searchButton.disabled = true;
    searchButton.classList.add('opacity-75');
}

function enableSearchButton() {
    searchButton.disabled = false;
    searchButton.classList.remove('opacity-75');
}

// Handle browser back/forward navigation
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
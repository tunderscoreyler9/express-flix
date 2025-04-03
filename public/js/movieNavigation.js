/**
 * Handles navigation when the back button is clicked
 * Provides contextual navigation based on where the user came from
 * If user came from search results, it returns to those results
 * Otherwise, it performs standard browser back navigation
 * 
 * @param {string} searchQuery - The original search query if coming from search results
 */
function handleBackNavigation(searchQuery) {
    // If we have a search query and we came from search results
    if (searchQuery && document.referrer.includes('/?query=')) {
        window.location.href = `/?query=${encodeURIComponent(searchQuery)}`;
    } 
    // If we came from another movie page or any other page
    else {
        window.history.back();
    }
}

// Export the function if using modules (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleBackNavigation
    };
};
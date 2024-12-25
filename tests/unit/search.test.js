// tests/unit/search.test.js

/**
 * @jest-environment jsdom
 */

describe('Search Functionality', () => {
    let searchForm;
    let searchInput;
    let loadingState;
    let resultsSection;
    let searchButton;
    let handleSearch;

    beforeEach(() => {
        // Set up document body
        document.body.innerHTML = `
            <form id="searchForm">
                <input id="searchInput" type="search">
                <button id="searchButton" type="submit">Search</button>
            </form>
            <div id="loadingState" class="hidden"></div>
            <div id="resultsSection"></div>
        `;

        // Get DOM elements
        searchForm = document.getElementById('searchForm');
        searchInput = document.getElementById('searchInput');
        loadingState = document.getElementById('loadingState');
        resultsSection = document.getElementById('resultsSection');
        searchButton = document.getElementById('searchButton');

        // Mock fetch to return after a short delay
        global.fetch = jest.fn(() =>
            new Promise(resolve =>
                setTimeout(() => 
                    resolve({
                        ok: true,
                        text: () => Promise.resolve('<div id="resultsSection">Test results</div>')
                    }), 
                    100
                )
            )
        );

        // Mock history pushState
        window.history.pushState = jest.fn();

        // Create handleSearch function
        handleSearch = async (e) => {
            if (e) e.preventDefault();
            
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) return;

            loadingState.classList.remove('hidden');
            searchButton.disabled = true;

            try {
                const searchUrl = new URL(window.location.href);
                searchUrl.searchParams.set('query', searchTerm);
                window.history.pushState({}, '', searchUrl);

                const response = await fetch(searchUrl);
                if (!response.ok) throw new Error('Search failed');

                const html = await response.text();
                resultsSection.innerHTML = html;
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                loadingState.classList.add('hidden');
                searchButton.disabled = false;
            }
        };

        // Add event listener
        searchForm.addEventListener('submit', handleSearch);
    });

    test('search form exists', () => {
        expect(searchForm).toBeTruthy();
        expect(searchInput).toBeTruthy();
        expect(searchButton).toBeTruthy();
    });

    test('loading state is initially hidden', () => {
        expect(loadingState.classList.contains('hidden')).toBeTruthy();
    });

    test('form submission triggers loading state', async () => {
        searchInput.value = 'test movie';
        
        // Start the search
        const submitPromise = handleSearch(new Event('submit'));
        
        // Check immediate state (during loading)
        expect(loadingState.classList.contains('hidden')).toBeFalsy();
        expect(searchButton.disabled).toBeTruthy();
        
        // Wait for search to complete
        await submitPromise;
        
        // Check final state (after loading)
        expect(loadingState.classList.contains('hidden')).toBeTruthy();
        expect(searchButton.disabled).toBeFalsy();
    });

    test('empty search should not trigger fetch', () => {
        searchInput.value = '   ';
        searchForm.dispatchEvent(new Event('submit'));
        
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('successful search updates URL', async () => {
        searchInput.value = 'test movie';
        await handleSearch(new Event('submit'));
        
        expect(window.history.pushState).toHaveBeenCalled();
    });

    test('search button is re-enabled after search completes', async () => {
        searchInput.value = 'test movie';
        
        // Start the search
        const submitPromise = handleSearch(new Event('submit'));
        
        // Check the button is disabled during search
        expect(searchButton.disabled).toBeTruthy();
        
        // Wait for search to complete
        await submitPromise;
        
        // Check the button is re-enabled
        expect(searchButton.disabled).toBeFalsy();
    });
});

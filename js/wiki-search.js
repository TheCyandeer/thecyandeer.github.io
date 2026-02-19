document.addEventListener('DOMContentLoaded', function() {
    // Desktop Search
    const searchInput = document.getElementById('wiki-search-input');
    const resultsContainer = document.getElementById('wiki-search-results');
    
    // Mobile Search
    const searchInputMobile = document.getElementById('wiki-search-input-mobile');
    const resultsContainerMobile = document.getElementById('wiki-search-results-mobile');

    let searchIndex = [];
    let isIndexLoaded = false;
    let isLoading = false;

    // Determine path to search index JS file
    let indexScriptPath = 'js/wiki_search_index.js'; // Default for root

    // Robust way to find the root path: use the script tag itself
    // We look for the script tag that loaded THIS file (wiki-search.js)
    // wiki_search_index.js should be in the SAME directory as wiki-search.js
    
    const scripts = document.getElementsByTagName('script');
    let currentScript = null;
    for(let s of scripts) {
        if(s.src && s.src.includes('wiki-search.js')) {
            currentScript = s;
            break;
        }
    }

    if (currentScript) {
        const src = currentScript.getAttribute('src');
        // src could be "js/wiki-search.js" or "../js/wiki-search.js"
        // Since the index file is also in js/ folder, we just replace the filename
        
        if (src.includes('wiki-search.js')) {
             indexScriptPath = src.replace('wiki-search.js', 'wiki_search_index.js');
        }
    }

    function loadIndex(container) {
        return new Promise((resolve, reject) => {
            if (isIndexLoaded || window.WIKI_SEARCH_INDEX) {
                isIndexLoaded = true;
                searchIndex = window.WIKI_SEARCH_INDEX;
                resolve();
                return;
            }
            if (isLoading) return; // Should handle queueing but simple for now
            
            isLoading = true;
            
            const script = document.createElement('script');
            script.src = indexScriptPath;
            script.onload = () => {
                if (window.WIKI_SEARCH_INDEX) {
                    searchIndex = window.WIKI_SEARCH_INDEX;
                    isIndexLoaded = true;
                    console.log('Search index loaded:', searchIndex.length, 'items');
                    resolve();
                } else {
                    reject(new Error('Index loaded but WIKI_SEARCH_INDEX not found'));
                }
                isLoading = false;
            };
            script.onerror = (e) => {
                console.error('Error loading search index script:', e);
                if (container) container.innerHTML = '<div class="search-error">搜索服务暂不可用</div>';
                isLoading = false;
                reject(e);
            };
            document.head.appendChild(script);
        });
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function performSearch(query, container) {
        if (!container) return;

        if (!query) {
            container.style.display = 'none';
            return;
        }

        if (!isIndexLoaded) {
            container.innerHTML = '<div class="search-loading">正在加载索引...</div>';
            container.style.display = 'block';
            
            // If already loading, just wait; if not, start loading
            if (!isLoading) {
                loadIndex(container).then(() => {
                    if (isIndexLoaded) performSearch(query, container);
                });
            }
            return;
        }

        const lowerQuery = query.toLowerCase();
        
        const results = searchIndex.filter(item => {
            return item.title.toLowerCase().includes(lowerQuery) || 
                   item.content.toLowerCase().includes(lowerQuery);
        }).slice(0, 5); // Limit to 5 results

        if (results.length > 0) {
            const html = results.map(item => {
                // If we are deep, the item.url (wiki/...) needs to be prefixed with enough ../
                // But wait, if indexScriptPath is already resolved relative to current page (e.g. ../../js/wiki_search_index.js)
                // We can use that path to find the root.
                
                // Remove 'js/wiki_search_index.js' from the end of indexScriptPath to get the root path
                let rootPath = indexScriptPath.replace(/js\/wiki_search_index\.js$/, '');
                
                const finalUrl = rootPath + item.url;
                
                // Highlight matches in title
                const title = item.title.replace(new RegExp(query, 'gi'), match => `<span class="search-highlight">${match}</span>`);
                
                // Find and highlight matches in content snippet
                let snippet = '';
                const contentIndex = item.content.toLowerCase().indexOf(lowerQuery);
                if (contentIndex !== -1) {
                    const start = Math.max(0, contentIndex - 20);
                    const end = Math.min(item.content.length, contentIndex + query.length + 20);
                    snippet = item.content.substring(start, end);
                    if (start > 0) snippet = '...' + snippet;
                    if (end < item.content.length) snippet = snippet + '...';
                    snippet = snippet.replace(new RegExp(query, 'gi'), match => `<span class="search-highlight">${match}</span>`);
                } else {
                    snippet = item.content.substring(0, 50) + '...';
                }

                return `
                    <div class="search-result-item">
                        <a href="${finalUrl}">
                            <div class="search-result-title">${title}</div>
                            <div class="search-result-snippet">${snippet}</div>
                        </a>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="search-no-results">未找到相关内容</div>';
        }
        
        container.style.display = 'block';
    }

    // Attach listeners for Desktop
    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', debounce((e) => {
            performSearch(e.target.value, resultsContainer);
        }, 300));

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
        
        // Load index on focus
        searchInput.addEventListener('focus', () => {
             if (!isIndexLoaded && !isLoading) {
                 loadIndex(resultsContainer);
             }
        });
    }
    
    // Attach listeners for Mobile
    if (searchInputMobile && resultsContainerMobile) {
        searchInputMobile.addEventListener('input', debounce((e) => {
            performSearch(e.target.value, resultsContainerMobile);
        }, 300));

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInputMobile.contains(e.target) && !resultsContainerMobile.contains(e.target)) {
                resultsContainerMobile.style.display = 'none';
            }
        });
        
        // Load index on focus
        searchInputMobile.addEventListener('focus', () => {
             if (!isIndexLoaded && !isLoading) {
                 loadIndex(resultsContainerMobile);
             }
        });
    }
});

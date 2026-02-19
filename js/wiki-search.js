document.addEventListener('DOMContentLoaded', function() {
    // 桌面模式-搜索
    const searchInput = document.getElementById('wiki-search-input');
    const resultsContainer = document.getElementById('wiki-search-results');
    
    // 手机模式-搜索
    const searchInputMobile = document.getElementById('wiki-search-input-mobile');
    const resultsContainerMobile = document.getElementById('wiki-search-results-mobile');

    let searchIndex = [];
    let isIndexLoaded = false;
    let isLoading = false;

    let indexScriptPath = 'js/wiki_search_index.js';
    
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
            if (isLoading) return;
            
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
        }).slice(0, 5);

        if (results.length > 0) {
            const html = results.map(item => {
                let rootPath = indexScriptPath.replace(/js\/wiki_search_index\.js$/, '');
                
                const finalUrl = rootPath + item.url;
                
                const title = item.title.replace(new RegExp(query, 'gi'), match => `<span class="search-highlight">${match}</span>`);
                
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

    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', debounce((e) => {
            performSearch(e.target.value, resultsContainer);
        }, 300));

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
        
        searchInput.addEventListener('focus', () => {
             if (!isIndexLoaded && !isLoading) {
                 loadIndex(resultsContainer);
             }
        });
    }
    
    if (searchInputMobile && resultsContainerMobile) {
        searchInputMobile.addEventListener('input', debounce((e) => {
            performSearch(e.target.value, resultsContainerMobile);
        }, 300));

        document.addEventListener('click', (e) => {
            if (!searchInputMobile.contains(e.target) && !resultsContainerMobile.contains(e.target)) {
                resultsContainerMobile.style.display = 'none';
            }
        });
        
        searchInputMobile.addEventListener('focus', () => {
             if (!isIndexLoaded && !isLoading) {
                 loadIndex(resultsContainerMobile);
             }
        });
    }
});

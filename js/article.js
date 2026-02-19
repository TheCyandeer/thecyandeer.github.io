// 目录滚动高亮及折叠逻辑
(function() {
    const tocContainer = document.querySelector('.toc-list');
    if (!tocContainer) return;

    const parentItems = tocContainer.querySelectorAll('li');
    
    parentItems.forEach(item => {
        const subList = item.querySelector('ul');
        if (subList) {
            const arrow = document.createElement('span');
            arrow.className = 'toc-arrow';
            arrow.innerHTML = '▶';
            
            const link = item.querySelector('a');
            if (link) {
                link.parentNode.insertBefore(arrow, link.nextSibling);
                
                arrow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.classList.toggle('open');
                    
                    if (item.classList.contains('open')) {
                        arrow.style.transform = 'rotate(90deg)';
                    } else {
                        arrow.style.transform = 'rotate(0deg)';
                    }
                });
            }
        }
    });

    const tocLinks = document.querySelectorAll('.toc-list a');
    const sections = [];
    
    // 获取所有目录对应的章节标题元素
    tocLinks.forEach(link => {
        const id = link.getAttribute('href');
        if (id && id.startsWith('#')) {
            try {
                const targetId = decodeURIComponent(id).substring(1);
                const section = document.getElementById(targetId);
                
                if (section) {
                    sections.push({
                        link: link,
                        section: section,
                        parentLi: link.parentElement, // 直接父级 li
                        grandParentLi: link.parentElement.parentElement.parentElement // 可能的父级 li (li -> ul -> li)
                    });
                }
            } catch (e) {
                console.warn('Invalid selector:', id);
            }
        }
    });

    function onScroll() {
        // 视口顶部偏移量，用于判断“当前阅读位置”
        const scrollPos = window.scrollY + 100; 
        
        let currentSection = null;

        // 遍历所有章节，找到当前处于阅读视角的最后一个章节
        for (let i = 0; i < sections.length; i++) {
            const item = sections[i];
            if (item.section.offsetTop <= scrollPos) {
                currentSection = item;
            } else {
            }
        }

        // 如果滚动到底部，强制高亮最后一个
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            currentSection = sections[sections.length - 1];
        }

        // 更新高亮状态
        sections.forEach(item => {
            if (item === currentSection) {
                item.link.classList.add('active');
                
                // 展开父级菜单
                if (item.grandParentLi && item.grandParentLi.tagName === 'LI') {
                    item.grandParentLi.classList.add('open');
                    const arrow = item.grandParentLi.querySelector('.toc-arrow');
                    if (arrow) arrow.style.transform = 'rotate(90deg)';
                }
            } else {
                item.link.classList.remove('active');
            }
        });

        // 更新阅读进度
        updateProgress();
    }

    // 监听滚动事件
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // 初始化执行一次
    onScroll();

    // 2. 阅读进度与返回顶部逻辑
    function updateProgress() {
        const progressContainer = document.getElementById('progress-container');
        const progressText = document.getElementById('progress-text');
        const rocketIcon = document.getElementById('rocket-icon');

        const progressContainerMobile = document.getElementById('progress-container-mobile');
        const progressTextMobile = document.getElementById('progress-text-mobile');
        const rocketIconMobile = document.getElementById('rocket-icon-mobile');
        
        // 计算滚动百分比
        // scrollTop: 已滚动距离
        // scrollHeight: 文档总高度
        // clientHeight: 视口高度
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        let scrollPercent = 0;
        if (docHeight > 0) {
            scrollPercent = Math.round((scrollTop / docHeight) * 100);
        }
        
        // --- 桌面模式 ---
        if (progressContainer && progressText && rocketIcon) {
            // 显示逻辑：开始滚动后显示
            if (scrollTop > 100) {
                progressContainer.classList.add('visible');
            } else {
                progressContainer.classList.remove('visible');
            }
            
            // 到底部显示火箭
            if (scrollPercent >= 98 || (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                progressText.style.display = 'none';
                rocketIcon.style.display = 'inline';
                progressContainer.classList.add('show-rocket');
            } else {
                progressText.innerText = scrollPercent + '%';
                progressText.style.display = 'inline';
                rocketIcon.style.display = 'none';
                progressContainer.classList.remove('show-rocket');
            }
        }

        // --- Mobile Logic ---
        if (progressContainerMobile && progressTextMobile && rocketIconMobile) {
            // 显示逻辑：开始滚动后显示
            if (scrollTop > 100) {
                progressContainerMobile.classList.add('visible');
            } else {
                progressContainerMobile.classList.remove('visible');
            }

            // 到底部显示火箭
            if (scrollPercent >= 98 || (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                progressTextMobile.style.display = 'none';
                rocketIconMobile.style.display = 'inline';
                progressContainerMobile.classList.add('show-rocket');
            } else {
                progressTextMobile.innerText = scrollPercent + '%';
                progressTextMobile.style.display = 'inline';
                rocketIconMobile.style.display = 'none';
                progressContainerMobile.classList.remove('show-rocket');
            }
        }
    }
    
    // 绑定返回顶部点击事件 (HTML中已有 onclick="scrollToTop()"，这里定义全局函数)
    window.scrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // 鼠标悬停显示火箭逻辑
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
        progressContainer.addEventListener('mouseenter', () => {
            const progressText = document.getElementById('progress-text');
            const rocketIcon = document.getElementById('rocket-icon');
            if (progressText && rocketIcon) {
                // 暂存当前显示状态
                progressContainer.dataset.showText = progressText.style.display !== 'none';
                
                progressText.style.display = 'none';
                rocketIcon.style.display = 'inline';
                progressContainer.classList.add('show-rocket');
            }
        });
        
        progressContainer.addEventListener('mouseleave', () => {
            const progressText = document.getElementById('progress-text');
            const rocketIcon = document.getElementById('rocket-icon');
            
            // 如果不是到底部（到底部本来就显示火箭），则恢复显示百分比
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            let scrollPercent = 0;
            if (docHeight > 0) {
                scrollPercent = Math.round((scrollTop / docHeight) * 100);
            }
            
            if (scrollPercent < 98 && (window.innerHeight + window.scrollY) < document.body.offsetHeight - 10) {
                if (progressText && rocketIcon) {
                    progressText.style.display = 'inline';
                    rocketIcon.style.display = 'none';
                    progressContainer.classList.remove('show-rocket');
                }
            }
        });
    }

    // 鼠标悬停显示火箭逻辑 (Mobile)
    const progressContainerMobile = document.getElementById('progress-container-mobile');
    if (progressContainerMobile) {
        progressContainerMobile.addEventListener('mouseenter', () => {
            const progressTextMobile = document.getElementById('progress-text-mobile');
            const rocketIconMobile = document.getElementById('rocket-icon-mobile');
            if (progressTextMobile && rocketIconMobile) {
                // 暂存当前显示状态
                progressContainerMobile.dataset.showText = progressTextMobile.style.display !== 'none';
                
                progressTextMobile.style.display = 'none';
                rocketIconMobile.style.display = 'inline';
                progressContainerMobile.classList.add('show-rocket');
            }
        });
        
        progressContainerMobile.addEventListener('mouseleave', () => {
            const progressTextMobile = document.getElementById('progress-text-mobile');
            const rocketIconMobile = document.getElementById('rocket-icon-mobile');
            
            // 如果不是到底部（到底部本来就显示火箭），则恢复显示百分比
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            let scrollPercent = 0;
            if (docHeight > 0) {
                scrollPercent = Math.round((scrollTop / docHeight) * 100);
            }
            
            if (scrollPercent < 98 && (window.innerHeight + window.scrollY) < document.body.offsetHeight - 10) {
                if (progressTextMobile && rocketIconMobile) {
                    progressTextMobile.style.display = 'inline';
                    rocketIconMobile.style.display = 'none';
                    progressContainerMobile.classList.remove('show-rocket');
                }
            }
        });
    }

})();

// 左侧文章分类折叠逻辑
(function() {
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            item.classList.toggle('open');
        });
    });
})();

// 代码块行号逻辑
(function() {
    const codeBlocks = document.querySelectorAll('.article-body pre code');
    
    codeBlocks.forEach(code => {
        const pre = code.parentElement;
        
        if (pre.querySelector('.line-numbers')) return;
        
        const text = code.innerText;
        let lines = text.split('\n');
        
        if (lines.length > 0 && lines[lines.length - 1] === '') {
            lines.pop();
        }
        
        const lineCount = lines.length;
        
        const lineNumbersWrapper = document.createElement('div');
        lineNumbersWrapper.className = 'line-numbers';
        
        let spans = '';
        for (let i = 1; i <= lineCount; i++) {
            spans += `<span>${i}</span>`;
        }
        lineNumbersWrapper.innerHTML = spans;
        
        pre.insertBefore(lineNumbersWrapper, code);
    });
})();

// 手机模式工具栏
(function() {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const closeBtn = document.getElementById('mobile-sidebar-close');
    const sidebarInner = document.getElementById('sidebar-inner');
    
    if (toggleBtn && sidebarInner) {
        toggleBtn.addEventListener('click', function() {
            sidebarInner.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeBtn && sidebarInner) {
        closeBtn.addEventListener('click', function() {
            sidebarInner.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (sidebarInner) {
        const links = sidebarInner.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                if (window.getComputedStyle(toggleBtn).display !== 'none') {
                     sidebarInner.classList.remove('active');
                     document.body.style.overflow = '';
                }
            });
        });
    }
})();

// 代码块复制按钮逻辑
(function() {
    const codeBlocks = document.querySelectorAll('.article-body pre');
    
    codeBlocks.forEach(pre => {
        if (pre.querySelector('.copy-btn')) return;

        // 创建复制按钮
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        
        // 添加到 pre 元素中
        pre.appendChild(btn);
        
        // 点击事件
        btn.addEventListener('click', async () => {
            const code = pre.querySelector('code');
            if (!code) return;
            
            const text = code.innerText;
            
            try {
                await navigator.clipboard.writeText(text);
                
                // 成功反馈
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                
                // 2秒后恢复
                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    btn.textContent = 'Copied!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = 'Copy';
                        btn.classList.remove('copied');
                    }, 2000);
                } catch (e) {
                    btn.textContent = 'Error';
                }
                document.body.removeChild(textarea);
            }
        });
    });
})();
// 目录滚动高亮及折叠逻辑
(function() {
    const tocContainer = document.querySelector('.toc-list');
    if (!tocContainer) return;

    // 1. 初始化折叠功能
    // 找到所有有子菜单的 li
    const parentItems = tocContainer.querySelectorAll('li');
    
    parentItems.forEach(item => {
        const subList = item.querySelector('ul');
        if (subList) {
            // 添加箭头图标
            const arrow = document.createElement('span');
            arrow.className = 'toc-arrow';
            arrow.innerHTML = '▶'; // 使用实心三角
            
            // 插入到链接后面
            const link = item.querySelector('a');
            if (link) {
                link.parentNode.insertBefore(arrow, link.nextSibling);
                
                // 点击箭头切换折叠状态
                arrow.addEventListener('click', (e) => {
                    e.stopPropagation(); // 防止冒泡
                    item.classList.toggle('open');
                    
                    // 旋转箭头
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
        // 只处理内部锚点
        if (id && id.startsWith('#')) {
            // 处理 ID 中可能包含的特殊字符（Markdown生成ID时可能会有）
            try {
                // 如果ID包含中文或其他特殊字符，querySelector可能需要转义，但在href中通常是编码过的或者直接ID
                // 这里假设href直接对应id
                // 注意：decodeURIComponent 用于处理编码过的URL
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
                // 因为章节是顺序的，一旦超过，后面的都不用看了
                // 但为了保险（布局可能复杂），还是遍历或者倒序遍历比较好
                // 这里用顺序遍历找最后一个满足条件的
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
                // 不自动折叠，保持用户展开的状态，或者只保留当前的？
                // 通常只展开当前的比较清爽，但如果用户手动展开了其他，也不要强制关掉
                // 这里暂不自动关闭
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
        
        // --- Desktop Logic ---
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
            // 显示逻辑：开始滚动后显示 (Same threshold as desktop)
            if (scrollTop > 100) {
                progressContainerMobile.classList.add('visible');
            } else {
                progressContainerMobile.classList.remove('visible');
            }

            // 到底部显示火箭
            if (scrollPercent >= 98 || (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                progressTextMobile.style.display = 'none';
                rocketIconMobile.style.display = 'inline';
                progressContainerMobile.classList.add('show-rocket'); // Reuse same class for style if needed, or just logic
            } else {
                progressTextMobile.innerText = scrollPercent + '%';
                progressTextMobile.style.display = 'inline'; // Ensure text is visible
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
        
        // Check if line numbers already exist
        if (pre.querySelector('.line-numbers')) return;
        
        // Count lines
        const text = code.innerText;
        // Split by newline, but careful with trailing newline often present in <pre>
        let lines = text.split('\n');
        
        // If the last line is empty (common in pre), ignore it for numbering
        if (lines.length > 0 && lines[lines.length - 1] === '') {
            lines.pop();
        }
        
        const lineCount = lines.length;
        
        // If single line, maybe don't show numbers? Or always show? 
        // User asked to add line numbers, usually implies always.
        
        const lineNumbersWrapper = document.createElement('div');
        lineNumbersWrapper.className = 'line-numbers';
        
        // Generate spans for each line number
        let spans = '';
        for (let i = 1; i <= lineCount; i++) {
            spans += `<span>${i}</span>`;
        }
        lineNumbersWrapper.innerHTML = spans;
        
        // Insert before code
        pre.insertBefore(lineNumbersWrapper, code);
    });
})();

// Mobile Sidebar Toggle Logic
(function() {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const closeBtn = document.getElementById('mobile-sidebar-close');
    const sidebarInner = document.getElementById('sidebar-inner');
    
    if (toggleBtn && sidebarInner) {
        toggleBtn.addEventListener('click', function() {
            sidebarInner.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }
    
    if (closeBtn && sidebarInner) {
        closeBtn.addEventListener('click', function() {
            sidebarInner.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close sidebar when clicking a link inside it (on mobile)
    if (sidebarInner) {
        const links = sidebarInner.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                // Only if on mobile (check if toggle is visible or just check window width)
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
        // Check if button already exists (to prevent duplicates if script runs multiple times)
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
                // Fallback for older browsers
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
// 菜单交互逻辑
(function() {
    // 菜单按钮交互
    var menuBtn = document.querySelector('.menu-btn');
    var menuOverlay = document.getElementById('menu-overlay');
    
    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        });
    }

    // 主题切换逻辑
    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    var body = document.body;
    var themeText = document.querySelector('.theme-text');

    // 检查本地存储中的主题偏好
    var savedTheme = localStorage.getItem('theme');
    
    // 这里我们默认浅色，如果有保存则用保存的
    var currentTheme = savedTheme || 'light';

    // 初始化应用主题
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeText) themeText.textContent = '切换亮色';
    } else {
        body.classList.remove('dark-mode');
        if (themeText) themeText.textContent = '切换暗色';
    }

    // 切换按钮点击事件
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            
            var isDarkMode = body.classList.contains('dark-mode');
            
            // 更新本地存储
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            // 更新按钮文本
            if (themeText) {
                themeText.textContent = isDarkMode ? '切换亮色' : '切换暗色';
            }
        });
    }
})();

// Video Accordion Animation
(function() {
    const accordions = []; // Store all accordion instances

    class Accordion {
        constructor(el) {
            this.el = el;
            this.summary = el.querySelector('summary');
            this.content = el.querySelector('.video-content');
            this.animation = null;
            this.isClosing = false;
            this.isExpanding = false;
            this.summary.addEventListener('click', (e) => this.onClick(e));
            accordions.push(this); // Add this instance to the list
        }

        onClick(e) {
            e.preventDefault();
            this.el.style.overflow = 'hidden';
            if (this.isClosing || !this.el.open) {
                // Close other open accordions
                accordions.forEach(acc => {
                    if (acc !== this && (acc.el.open || acc.isExpanding)) {
                        acc.shrink();
                    }
                });
                this.open();
            } else if (this.isExpanding || this.el.open) {
                this.shrink();
            }
        }

        open() {
            this.el.style.height = `${this.el.offsetHeight}px`;
            this.el.open = true;
            window.requestAnimationFrame(() => this.expand());
        }

        expand() {
            this.isExpanding = true;
            const startHeight = `${this.el.offsetHeight}px`;
            const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;
            
            if (this.animation) {
                this.animation.cancel();
            }
            
            this.animation = this.el.animate({
                height: [startHeight, endHeight]
            }, {
                duration: 400,
                easing: 'ease-out'
            });

            this.animation.onfinish = () => this.onAnimationFinish(true);
            this.animation.oncancel = () => this.isExpanding = false;
        }

        shrink() {
            this.isClosing = true;
            const startHeight = `${this.el.offsetHeight}px`;
            const endHeight = `${this.summary.offsetHeight}px`;

            if (this.animation) {
                this.animation.cancel();
            }

            this.animation = this.el.animate({
                height: [startHeight, endHeight]
            }, {
                duration: 400,
                easing: 'ease-out'
            });

            this.animation.onfinish = () => this.onAnimationFinish(false);
            this.animation.oncancel = () => this.isClosing = false;
        }

        onAnimationFinish(open) {
            this.el.open = open;
            this.animation = null;
            this.isClosing = false;
            this.isExpanding = false;
            this.el.style.height = '';
            this.el.style.overflow = '';
        }
    }

    const details = document.querySelectorAll('.video-accordion details');
    details.forEach((el) => {
        new Accordion(el);
    });
})();

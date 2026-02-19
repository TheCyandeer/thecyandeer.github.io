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
    
    // 如果没有存储偏好，默认使用浅色，或者可以检查系统偏好
    // var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // var currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
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

// 问候语逻辑
(function() {
    var greetingBox = document.getElementById('greeting-box');
    if (greetingBox) {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var totalMinutes = hours * 60 + minutes;
        var text = "";

        if (totalMinutes >= 360 && totalMinutes < 540) { // 06:00 - 09:00
            text = "早安，我是青鹿，欢迎来茶馆做客";
        } else if (totalMinutes >= 540 && totalMinutes < 720) { // 09:00 - 12:00
            text = "上午好，我是青鹿，欢迎来茶馆做客";
        } else if (totalMinutes >= 720 && totalMinutes < 840) { // 12:00 - 14:00
            text = "中午好，我是青鹿，欢迎来茶馆做客";
        } else if (totalMinutes >= 840 && totalMinutes < 1080) { // 14:00 - 18:00
            text = "下午好，我是青鹿，欢迎来茶馆做客";
        } else if (totalMinutes >= 1080 && totalMinutes < 1170) { // 18:00 - 19:30
            text = "傍晚好，我是青鹿。欢迎来茶馆做客";
        } else if (totalMinutes >= 1170 && totalMinutes < 1440) { // 19:30 - 24:00
            text = "晚上好，我是青鹿，欢迎来茶馆做客";
        } else { // 00:00 - 06:00
            text = "你好，我是青鹿，欢迎来茶馆做客";
        }
        greetingBox.innerHTML = text + "<br>";
    }
})();

// 轮播图逻辑
(function() {
    var carouselData = [
        {
            img: "image/rmain-a.png",
            title: "花下青鹿",
            sub1: "花下归来，带月敲门",
            sub2: "一只普通的森林小鹿",
            link: "https://space.bilibili.com/241183618"
        },
        {
            img: "image/rmain-b.png", 
            title: "西岚屿",
            sub1: "原创幻想世界设定集",
            sub2: "期待与你在梦中相遇",
            link: "wiki.html"
        },
        {
            img: "image/rmain-c.png", 
            title: "感谢赞助",
            sub1: "创世之路,有你相伴",
            sub2: "点击查看赞助明细",
            link: "sponsor.html"
        }
    ];

    var currentIndex = 0;
    var intervalId;
    var wrapper = document.getElementById('carousel-images-wrapper');
    var titleEl = document.getElementById('carousel-title');
    var subtitleEl = document.getElementById('carousel-subtitle');
    var controls = document.getElementById('carousel-controls');
    var buttons = controls ? controls.querySelectorAll('.carousel-btn') : [];


    // 初始化图片
    if (wrapper) {
        carouselData.forEach(function(item, index) {
            var a = document.createElement('a');
            a.href = item.link;
            a.target = "_blank";
            a.style.display = "contents";
            
            var img = document.createElement('img');
            img.src = item.img;
            img.alt = item.title;
            if (index === 0) {
                img.classList.add('active');
            }
            a.appendChild(img);
            wrapper.appendChild(a);
        });
    }

    var images = wrapper ? wrapper.querySelectorAll('img') : [];

    function updateCarousel(index) {
        // 更新按钮状态
        buttons.forEach(function(btn, i) {
            if (i === index) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        

        
        // 更新标题和副标题链接
        if (titleEl) titleEl.href = carouselData[index].link;
        if (subtitleEl) subtitleEl.href = carouselData[index].link;

        // 更新图片 (交叉溶解: 只需切换 active 类)
        images.forEach(function(img, i) {
            if (i === index) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });

        // 文字更新逻辑 (保持淡入淡出)
        if (titleEl) titleEl.style.opacity = 0;
        if (subtitleEl) subtitleEl.style.opacity = 0;

        setTimeout(function() {
            if (titleEl) {
                titleEl.innerText = carouselData[index].title;
                titleEl.style.opacity = 1;
            }
            if (subtitleEl) {
                subtitleEl.innerHTML = '<div class="subtitle">' + carouselData[index].sub1 + '</div>' +
                                       '<div class="subtitle">' + carouselData[index].sub2 + '</div>';
                subtitleEl.style.opacity = 1;
            }
        }, 500); // 等待图片切换过渡的一半时间
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % carouselData.length;
        updateCarousel(currentIndex);
    }

    // 绑定点击事件
    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var index = parseInt(this.getAttribute('data-index'));
            currentIndex = index;
            updateCarousel(currentIndex);
            resetInterval();
        });
    });

    // 自动轮播
    function startInterval() {
        intervalId = setInterval(nextSlide, 5000);
    }

    function resetInterval() {
        clearInterval(intervalId);
        startInterval();
    }

    if (wrapper) {
        startInterval();
    }
})();

(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (slides.length > 1) {
            if (prev) {
                prev.addEventListener('click', function () {
                    showSlide(current - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    showSlide(current + 1);
                    startTimer();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                    startTimer();
                });
            });

            startTimer();
        }
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterPanel && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
        var searchInput = filterPanel.querySelector('[data-filter-search]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var regionSelect = filterPanel.querySelector('[data-filter-region]');
        var result = filterPanel.querySelector('[data-filter-result]');

        function uniqueValues(attribute) {
            var values = cards.map(function (card) {
                return card.getAttribute(attribute) || '';
            }).filter(Boolean);
            return Array.from(new Set(values)).sort(function (a, b) {
                return b.localeCompare(a, 'zh-CN', { numeric: true });
            });
        }

        function fillSelect(select, attribute) {
            if (!select) {
                return;
            }

            uniqueValues(attribute).forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (year && card.getAttribute('data-year') !== year) {
                    matched = false;
                }

                if (type && card.getAttribute('data-type') !== type) {
                    matched = false;
                }

                if (region && card.getAttribute('data-region') !== region) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (result) {
                result.textContent = '当前显示 ' + visibleCount + ' / ' + cards.length + ' 部影片';
            }
        }

        fillSelect(yearSelect, 'data-year');
        fillSelect(typeSelect, 'data-type');
        fillSelect(regionSelect, 'data-region');

        [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function initializePlayer(player) {
        var video = player.querySelector('video[data-hls-src]');
        var button = player.querySelector('[data-player-button]');
        var message = player.querySelector('[data-player-message]');

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-hls-src');
        var initialized = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function play() {
            if (!initialized) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    initialized = true;
                    setMessage('已启用浏览器原生 HLS 播放。');
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('HLS 播放源加载完成。');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源暂时无法加载，可刷新页面后重试。');
                        }
                    });
                    initialized = true;
                } else {
                    video.src = source;
                    initialized = true;
                    setMessage('当前浏览器不支持 HLS.js，已尝试直接加载播放源。');
                }
            }

            player.classList.add('is-playing');
            var request = video.play();

            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    setMessage('浏览器阻止自动播放，请再次点击视频播放按钮。');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
}());

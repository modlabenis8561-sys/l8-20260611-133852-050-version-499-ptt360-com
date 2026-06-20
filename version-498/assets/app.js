(function () {
    var navButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('active', pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('active', pos === current);
            });
        };

        var play = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };

        dots.forEach(function (dot, pos) {
            dot.addEventListener('click', function () {
                show(pos);
                play();
            });
        });

        show(0);
        play();
    }

    var url = new URL(window.location.href);
    var queryInput = document.querySelector('[data-filter-query]');
    if (queryInput && url.searchParams.get('q')) {
        queryInput.value = url.searchParams.get('q');
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-search-card]'));
        var noResults = document.querySelector('[data-no-results]');
        var channelSelect = document.querySelector('[data-filter-channel]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var sortSelect = document.querySelector('[data-filter-sort]');
        var resultText = document.querySelector('[data-filter-result]');

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var applyFilter = function () {
            var q = normalize(queryInput ? queryInput.value : '');
            var channel = channelSelect ? channelSelect.value : 'all';
            var type = typeSelect ? typeSelect.value : 'all';
            var visible = [];

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var channelMatch = channel === 'all' || card.getAttribute('data-channel') === channel;
                var typeMatch = type === 'all' || card.querySelector('.movie-meta-row span:last-child').textContent === type;
                var queryMatch = !q || text.indexOf(q) !== -1;
                var keep = channelMatch && typeMatch && queryMatch;
                card.classList.toggle('is-hidden-card', !keep);
                if (keep) {
                    visible.push(card);
                }
            });

            var sortValue = sortSelect ? sortSelect.value : 'default';
            visible.sort(function (a, b) {
                if (sortValue === 'year') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                if (sortValue === 'score') {
                    return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                }
                return 0;
            });
            visible.forEach(function (card) {
                filterRoot.appendChild(card);
            });

            if (noResults) {
                noResults.classList.toggle('show', visible.length === 0);
            }
            if (resultText) {
                resultText.textContent = visible.length ? '已筛选出匹配影片' : '没有匹配影片';
            }
        };

        [queryInput, channelSelect, typeSelect, sortSelect].forEach(function (el) {
            if (el) {
                el.addEventListener('input', applyFilter);
                el.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('[data-cover-layer]');
        var button = box.querySelector('[data-play]');
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-video-src');
        var prepared = false;
        var start = function () {
            if (!src) {
                return;
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (prepared) {
                video.play().catch(function () {});
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        video.src = src;
                        video.play().catch(function () {});
                    }
                });
            } else {
                video.src = src;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
            }
        };
        if (button) {
            button.addEventListener('click', start);
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    });
})();

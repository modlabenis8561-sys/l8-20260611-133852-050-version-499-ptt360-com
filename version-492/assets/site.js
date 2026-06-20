(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return String(value || '').toLowerCase();
    }

    function setupMenu() {
        var button = qs('[data-menu-toggle]');
        var menu = qs('[data-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        var index = 0;
        function show(next) {
            index = next;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }
    }

    function setupFilters() {
        var list = qs('[data-filter-list]');
        var bar = qs('[data-filter-bar]');
        if (!list || !bar) {
            return;
        }
        var input = qs('[data-filter-text]', bar);
        var year = qs('[data-filter-year]', bar);
        var region = qs('[data-filter-region]', bar);
        var cards = qsa('[data-card]', list);
        var empty = qs('[data-empty-state]');
        function apply() {
            var q = text(input && input.value);
            var y = year && year.value;
            var r = region && region.value;
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = text([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category')
                ].join(' '));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (y && card.getAttribute('data-year') !== y) {
                    ok = false;
                }
                if (r && card.getAttribute('data-region').indexOf(r) === -1) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        [input, year, region].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card">',
            '<a class="card-cover" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="cover-shade"></span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
            '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="card-tags"><span class="tag">' + escapeHtml(item.category) + '</span><span class="tag">' + escapeHtml(item.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var results = qs('#search-results');
        if (!results || typeof SEARCH_ITEMS === 'undefined') {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var category = params.get('category') || '';
        var input = qs('[data-page-search-input]');
        var select = qs('[data-page-search-category]');
        var empty = qs('#search-empty');
        if (input) {
            input.value = query;
        }
        if (select) {
            select.value = category;
        }
        var q = text(query);
        var c = text(category);
        var items = SEARCH_ITEMS.filter(function (item) {
            var haystack = text([
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.tags,
                item.oneLine,
                item.category
            ].join(' '));
            if (q && haystack.indexOf(q) === -1) {
                return false;
            }
            if (c && text(item.category) !== c) {
                return false;
            }
            return q || c;
        }).slice(0, 120);
        results.innerHTML = items.map(cardTemplate).join('');
        if (empty) {
            empty.classList.toggle('is-visible', items.length === 0);
            if (q || c) {
                empty.textContent = '暂无匹配内容';
            }
        }
    }

    function setupPlayer() {
        var video = qs('[data-player-video]');
        var button = qs('[data-player-button]');
        if (!video || !button) {
            return;
        }
        var streamUrl = video.getAttribute('data-stream-url');
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            attach();
            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }
        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayer();
    });
})();

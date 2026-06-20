
(function () {
    var header = document.querySelector('.site-header');
    var menuButton = document.querySelector('.menu-toggle');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    if (menuButton && header) {
        menuButton.addEventListener('click', function () {
            header.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('.site-nav a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (header) {
                header.classList.remove('menu-open');
            }
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    var searchInput = document.querySelector('[data-search-input]');
    var filterControls = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function matchFilter(card, name, value) {
        if (!value) {
            return true;
        }
        return normalize(card.getAttribute('data-' + name)) === normalize(value);
    }

    function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-title'));
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            filterControls.forEach(function (control) {
                matched = matched && matchFilter(card, control.getAttribute('data-filter'), control.value);
            });
            card.hidden = !matched;
        });
    }

    if (searchInput || filterControls.length) {
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        filterControls.forEach(function (control) {
            control.addEventListener('change', applyFilters);
        });
        applyFilters();
    }
})();

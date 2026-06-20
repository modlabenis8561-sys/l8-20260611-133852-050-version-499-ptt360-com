(function () {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupImages() {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("image-missing");
                if (img.parentElement) {
                    img.parentElement.classList.add("image-missing");
                }
            });
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        restart();
    }

    function setupFilters() {
        var input = document.querySelector("[data-search-input]");
        var region = document.querySelector("[data-filter-region]");
        var type = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!cards.length || (!input && !region && !type)) {
            return;
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            cards.forEach(function (card) {
                var title = normalize(card.getAttribute("data-title"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var tags = normalize(card.getAttribute("data-tags"));
                var haystack = [title, cardRegion, cardType, year, tags].join(" ");
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
                var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
                card.classList.toggle("hidden-by-filter", !(matchedKeyword && matchedRegion && matchedType));
            });
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function setupPlayer() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        if (!panels.length) {
            return;
        }
        panels.forEach(function (panel) {
            var video = panel.querySelector("video[data-hls]");
            var button = panel.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var hlsInstance = null;

            function bind() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                var hlsUrl = video.getAttribute("data-hls");
                if (!hlsUrl) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(hlsUrl);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = hlsUrl;
                } else {
                    video.src = hlsUrl;
                }
                video.setAttribute("data-ready", "1");
            }

            function play() {
                bind();
                panel.classList.add("is-playing");
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        panel.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                panel.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    panel.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupImages();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();

(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(index + 1);
        }, 6200);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function readQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
        var input = panel.querySelector("[data-filter-input]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var section = panel.parentElement;
        var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
        var emptyState = section.querySelector("[data-empty-state]");
        var initialQuery = readQueryParam("q");

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function matchYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            if (selectedYear === "older") {
                return Number(cardYear) <= 2021;
            }
            return String(cardYear) === selectedYear;
        }

        function applyFilters() {
            var query = normalize(input ? input.value : "");
            var selectedYear = yearSelect ? yearSelect.value : "";
            var selectedType = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = normalize(card.getAttribute("data-type"));
                var ok = true;

                if (query && searchText.indexOf(query) === -1) {
                    ok = false;
                }
                if (!matchYear(cardYear, selectedYear)) {
                    ok = false;
                }
                if (selectedType && cardType.indexOf(selectedType) === -1) {
                    ok = false;
                }

                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });
})();

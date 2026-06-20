(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.getElementById("mobilePanel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length === 0) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function setLocalFilters() {
        var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-list-filter]"));
        filterInputs.forEach(function (input) {
            var selector = input.getAttribute("data-list-filter");
            var container = document.querySelector(selector);
            if (!container) {
                return;
            }
            var clearButton = input.closest(".filter-card") ? input.closest(".filter-card").querySelector("[data-clear-filter]") : null;
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
            var empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "没有找到匹配的影片";

            function applyFilter(value) {
                var query = (value || "").trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var match = !query || haystack.indexOf(query) !== -1;
                    card.classList.toggle("is-filtered-out", !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (visible === 0 && !empty.parentNode) {
                    container.appendChild(empty);
                }
                if (visible > 0 && empty.parentNode) {
                    empty.parentNode.removeChild(empty);
                }
            }

            input.addEventListener("input", function () {
                applyFilter(input.value);
            });

            if (clearButton) {
                clearButton.addEventListener("click", function () {
                    input.value = "";
                    applyFilter("");
                    input.focus();
                    document.querySelectorAll("[data-chip-filter]").forEach(function (chip) {
                        chip.classList.remove("active");
                    });
                });
            }
        });

        document.querySelectorAll("[data-chip-filter]").forEach(function (chip) {
            chip.addEventListener("click", function () {
                var input = document.querySelector("[data-list-filter]");
                if (!input) {
                    return;
                }
                var value = chip.getAttribute("data-chip-filter") || chip.textContent;
                var active = chip.classList.toggle("active");
                document.querySelectorAll("[data-chip-filter]").forEach(function (other) {
                    if (other !== chip) {
                        other.classList.remove("active");
                    }
                });
                input.value = active ? value : "";
                input.dispatchEvent(new Event("input"));
            });
        });
    }

    ready(function () {
        setMobileMenu();
        setHeroCarousel();
        setLocalFilters();
    });
})();

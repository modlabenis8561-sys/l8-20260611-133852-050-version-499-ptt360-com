(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function cardTemplate(movie) {
        var tags = String(movie.genre || movie.type || "影视").split(/[，,\/、]+/).filter(Boolean).slice(0, 2);
        var tagHtml = tags.map(function (tag, index) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\" data-movie-card data-search=\"" + escapeHtml([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.year, movie.category].join(" ")) + "\">" +
                "<a class=\"poster-wrap\" href=\"" + escapeHtml(movie.file) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"poster-play\">▶</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                    "<div class=\"card-tags\">" + tagHtml + "</div>" +
                    "<h3><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                "</div>" +
            "</article>";
    }

    function searchMovies(query) {
        var movies = window.searchMovies || [];
        var normalized = query.toLowerCase();
        if (!normalized) {
            return movies.slice(0, 120);
        }
        return movies.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.year, movie.oneLine, movie.category].join(" ").toLowerCase();
            return haystack.indexOf(normalized) !== -1;
        });
    }

    function render() {
        var query = getQuery();
        var input = document.getElementById("searchInput");
        var title = document.getElementById("searchTitle");
        var intro = document.getElementById("searchIntro");
        var results = document.getElementById("searchResults");
        if (!results) {
            return;
        }
        if (input) {
            input.value = query;
        }
        var matches = searchMovies(query);
        if (title) {
            title.textContent = query ? "搜索 “" + query + "”" : "精选影片";
        }
        if (intro) {
            intro.textContent = matches.length ? "点击影片卡片进入详情播放。" : "没有找到匹配的影片，请尝试其他关键词。";
        }
        if (!matches.length) {
            results.innerHTML = "<div class=\"empty-state\">没有找到匹配的影片</div>";
            return;
        }
        results.innerHTML = matches.map(cardTemplate).join("");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }
})();

(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    var typeFilters = Array.prototype.slice.call(document.querySelectorAll("[data-type-filter]"));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector(".no-results");

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var query = normalize(searchInputs.map(function (input) { return input.value; }).find(Boolean));
      var type = typeFilters.map(function (select) { return select.value; }).find(Boolean) || "";
      var year = yearFilters.map(function (select) { return select.value; }).find(Boolean) || "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesType = !type || card.getAttribute("data-type") === type;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var isVisible = matchesText && matchesType && matchesYear;
        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.style.display = visible ? "none" : "block";
      }
    }

    searchInputs.concat(typeFilters).concat(yearFilters).forEach(function (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var source = player.getAttribute("data-src");
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var loaded = false;
      var hlsInstance = null;

      function loadSource() {
        if (!video || !source || loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }

      function playVideo() {
        loadSource();
        if (!video) {
          return;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();

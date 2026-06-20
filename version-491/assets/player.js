(function () {
    function initMoviePlayer(elementId, sourceUrl, posterUrl) {
        var root = document.getElementById(elementId);
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var overlay = root.querySelector("[data-player-overlay]");
        var button = root.querySelector("[data-play-button]");
        var hlsInstance = null;
        var started = false;

        if (!video) {
            return;
        }

        if (posterUrl) {
            video.setAttribute("poster", posterUrl);
        }

        function attachSource() {
            if (started) {
                return;
            }
            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (button) {
            button.addEventListener("click", attachSource);
        }
        if (overlay && overlay !== button) {
            overlay.addEventListener("click", attachSource);
        }
        video.addEventListener("click", function () {
            if (!started) {
                attachSource();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();

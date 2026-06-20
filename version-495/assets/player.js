
(function () {
    function setup(frame) {
        var video = frame.querySelector('video');
        var overlay = frame.querySelector('.play-overlay');
        var message = frame.querySelector('.player-message');
        var streamUrl = video ? video.getAttribute('data-stream') : '';
        var hls = null;
        var loaded = false;

        function showMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.hidden = true;
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }
            var started = video.play();
            if (started && typeof started.catch === 'function') {
                started.catch(function () {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        function load() {
            if (!video || !streamUrl) {
                showMessage('暂时无法播放，请稍后再试');
                return;
            }
            hideOverlay();
            showMessage('');
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showMessage('暂时无法播放，请稍后再试');
                    }
                });
                return;
            }
            video.src = streamUrl;
            playVideo();
        }

        if (overlay) {
            overlay.addEventListener('click', load);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    load();
                }
            });
            video.addEventListener('play', hideOverlay);
            video.addEventListener('error', function () {
                showMessage('暂时无法播放，请稍后再试');
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.player-frame').forEach(setup);
})();

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const clickSound = document.getElementById('minecraft-click');
    const mainMusicPlayer = document.getElementById('main-music-player');
    const settingsLinkNav = document.getElementById('settings-link-nav');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsButton = document.getElementById('close-settings');

    const musicToggleButton = document.getElementById('music-toggle-button');
    const musicToggleImg = document.getElementById('music-toggle-img');
    const musicVolumeSlider = document.getElementById('music-volume');

    const clickToggleButton = document.getElementById('click-toggle-button');
    const clickToggleImg = document.getElementById('click-toggle-img');
    const clickVolumeSlider = document.getElementById('click-volume');

    const prevSongButton = document.getElementById('prev-song');
    const nextSongButton = document.getElementById('next-song');
    const playPauseButton = document.getElementById('play-pause-song');
    const currentSongNameDisplay = document.getElementById('current-song-name');

    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeToggleImg = document.getElementById('theme-toggle-img');

    const songPlaylist = [
        { src: 'sounds/mainmenu.mp3', name: 'Minecraft Music' },
        { src: 'sounds/mainmenu1.mp3', name: 'Silly music' },
        { src: 'sounds/mainmenu2.mp3', name: 'Amazing' }
    ];
    let currentSongIndex = 0;
    let isMusicEnabled = true;
    let isClickSoundEnabled = true;
    let musicVolume = 0.5;
    let clickVolume = 1.0;
    let hasUserInteracted = false;
    let isDarkMode = false;

    const generalToggleImages = {
        on: 'image/toggle_on.png',
        off: 'image/toggle_off.png',
        onHover: 'image/toggle_on_hover.png',
        offHover: 'image/toggle_off_hover.png'
    };

    const themeToggleImages = {
        darkOn: 'image/toggle_on_dark.png',
        darkOff: 'image/toggle_off_dark.png',
        darkOnHover: 'image/toggle_on_dark_hover.png',
        darkOffHover: 'image/toggle_off_dark_hover.png'
    };

    const updatePlayPauseButton = () => {
        if (mainMusicPlayer && playPauseButton) {
            playPauseButton.textContent = mainMusicPlayer.paused || !isMusicEnabled ? '▶️' : '⏸️';
        }
    };

    const updateSongNameDisplay = () => {
        if (currentSongNameDisplay && songPlaylist[currentSongIndex]) {
            currentSongNameDisplay.textContent = songPlaylist[currentSongIndex].name;
        }
    };

    const loadSong = (index, playWhenReady = false) => {
        if (mainMusicPlayer && songPlaylist && songPlaylist[index]) {
            mainMusicPlayer.src = songPlaylist[index].src;
            mainMusicPlayer.volume = musicVolume;
            updateSongNameDisplay();
            if (playWhenReady && isMusicEnabled && hasUserInteracted) {
                mainMusicPlayer.play().catch(e => console.error("Error playing loaded song:", e));
            }
            updatePlayPauseButton();
        }
    };

    const playNextSong = () => {
        currentSongIndex = (currentSongIndex + 1) % songPlaylist.length;
        loadSong(currentSongIndex, true);
        saveSettings();
    };

    const playPrevSong = () => {
        currentSongIndex = (currentSongIndex - 1 + songPlaylist.length) % songPlaylist.length;
        loadSong(currentSongIndex, true);
        saveSettings();
    };

    if (mainMusicPlayer) {
        mainMusicPlayer.addEventListener('ended', () => {
            if (isMusicEnabled) playNextSong();
        });
        mainMusicPlayer.addEventListener('play', updatePlayPauseButton);
        mainMusicPlayer.addEventListener('pause', updatePlayPauseButton);
    }

    if (prevSongButton) prevSongButton.addEventListener('click', playPrevSong);
    if (nextSongButton) nextSongButton.addEventListener('click', playNextSong);

    if (playPauseButton && mainMusicPlayer) {
        playPauseButton.addEventListener('click', () => {
            if (!hasUserInteracted) {
                hasUserInteracted = true;
                 loadSong(currentSongIndex, false);
            }
            if (!isMusicEnabled) {
                 isMusicEnabled = true;
                 setToggleImageSrc(musicToggleImg, isMusicEnabled, false, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover);
                 saveSettings();
            }
            if (mainMusicPlayer.paused) {
                mainMusicPlayer.play().catch(e => console.error("Error playing music:", e));
            } else {
                mainMusicPlayer.pause();
            }
        });
    }

    const setToggleImageSrc = (imgElement, isEnabled, isHovering, onImg, offImg, onHoverImg, offHoverImg) => {
        if (!imgElement) return;
        if (isEnabled) {
            imgElement.src = isHovering ? onHoverImg : onImg;
        } else {
            imgElement.src = isHovering ? offHoverImg : offImg;
        }
    };

    const applyTheme = () => {
        if (isDarkMode) {
            body.classList.add('dark-theme');
            setToggleImageSrc(themeToggleImg, true, false, themeToggleImages.darkOn, themeToggleImages.darkOff, themeToggleImages.darkOnHover, themeToggleImages.darkOffHover);
        } else {
            body.classList.remove('dark-theme');
            setToggleImageSrc(themeToggleImg, false, false, themeToggleImages.darkOn, themeToggleImages.darkOff, themeToggleImages.darkOnHover, themeToggleImages.darkOffHover);
        }
    };

    const loadSettings = () => {
        const savedMusicEnabled = localStorage.getItem('isMusicEnabled');
        if (savedMusicEnabled !== null) isMusicEnabled = savedMusicEnabled === 'true';
        setToggleImageSrc(musicToggleImg, isMusicEnabled, false, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover);

        const savedClickEnabled = localStorage.getItem('isClickSoundEnabled');
        if (savedClickEnabled !== null) isClickSoundEnabled = savedClickEnabled === 'true';
        setToggleImageSrc(clickToggleImg, isClickSoundEnabled, false, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover);

        const savedMusicVolume = localStorage.getItem('musicVolume');
        if (savedMusicVolume !== null) {
            const parsed = parseFloat(savedMusicVolume);
            if (!isNaN(parsed)) musicVolume = parsed; else musicVolume = 0.5;
        }
        if (mainMusicPlayer) mainMusicPlayer.volume = musicVolume;
        if (musicVolumeSlider) musicVolumeSlider.value = musicVolume * 100;

        const savedClickVolume = localStorage.getItem('clickVolume');
        if (savedClickVolume !== null) {
            const parsed = parseFloat(savedClickVolume);
            if (!isNaN(parsed)) clickVolume = parsed; else clickVolume = 1.0;
        }
        if (clickSound) clickSound.volume = clickVolume;
        if (clickVolumeSlider) clickVolumeSlider.value = clickVolume * 100;

        const savedSongIndex = localStorage.getItem('currentSongIndex');
        if (savedSongIndex !== null) {
            currentSongIndex = parseInt(savedSongIndex, 10);
            if (isNaN(currentSongIndex) || currentSongIndex < 0 || currentSongIndex >= songPlaylist.length) {
                currentSongIndex = 0;
            }
        }
        loadSong(currentSongIndex, false);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            isDarkMode = true;
        } else {
            isDarkMode = false;
        }
        applyTheme();
        updatePlayPauseButton();
    };

    const saveSettings = () => {
        localStorage.setItem('isMusicEnabled', isMusicEnabled);
        localStorage.setItem('isClickSoundEnabled', isClickSoundEnabled);
        localStorage.setItem('musicVolume', musicVolume);
        localStorage.setItem('clickVolume', clickVolume);
        localStorage.setItem('currentSongIndex', currentSongIndex);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    };

    document.body.addEventListener('click', () => {
        if (!hasUserInteracted) {
            hasUserInteracted = true;
            if (isMusicEnabled && mainMusicPlayer && mainMusicPlayer.paused) {
                 loadSong(currentSongIndex, false);
                 mainMusicPlayer.play().catch(e => console.error("Initial music play error:", e));
            }
        }
    }, { once: true });

    const clickableElements = document.querySelectorAll('.clickable-element');
    clickableElements.forEach(element => {
        element.addEventListener('click', (event) => {
            if (isClickSoundEnabled && clickSound && !event.target.closest('.custom-slider')) {
                clickSound.volume = clickVolume;
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.error("Click sound error:", e));
            }
        });
    });

    const openSettingsModal = () => {
        if (settingsModal) settingsModal.style.display = 'flex';
    };
    const closeSettingsModal = (updateHash = true) => {
        if (settingsModal) settingsModal.style.display = 'none';
        if (updateHash && window.location.hash === '#settings') {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    };

    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash === '#settings') {
            openSettingsModal();
        } else {
            closeSettingsModal(false);
            let targetId = hash.substring(1);
            if (targetId === '' || targetId === 'home') targetId = 'home';
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                 setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                 },0);
            }
        }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    if (settingsLinkNav) {
        settingsLinkNav.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.hash = '#settings';
        });
    }

    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith("#") && href !== "#settings" && href !== "#") {
                e.preventDefault();
                window.location.hash = href;
            } else if (href === "#") {
                e.preventDefault();
                window.location.hash = "#home";
            }
        });
    });


    if (closeSettingsButton) closeSettingsButton.addEventListener('click', () => closeSettingsModal());
    if (settingsModal) {
        settingsModal.addEventListener('click', (event) => {
            if (event.target === settingsModal) closeSettingsModal();
        });
    }

    if (musicToggleButton && mainMusicPlayer && musicToggleImg) {
        musicToggleButton.addEventListener('click', () => {
            isMusicEnabled = !isMusicEnabled;
            setToggleImageSrc(musicToggleImg, isMusicEnabled, false, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover);
            if (isMusicEnabled) {
                if (!hasUserInteracted) hasUserInteracted = true;
                if (mainMusicPlayer.paused) {
                     loadSong(currentSongIndex, true);
                }
            } else {
                mainMusicPlayer.pause();
            }
            updatePlayPauseButton();
            saveSettings();
        });
        musicToggleButton.addEventListener('mouseenter', () => setToggleImageSrc(musicToggleImg, isMusicEnabled, true, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover));
        musicToggleButton.addEventListener('mouseleave', () => setToggleImageSrc(musicToggleImg, isMusicEnabled, false, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover));
    }

    if (musicVolumeSlider && mainMusicPlayer) {
        musicVolumeSlider.addEventListener('input', (event) => {
            musicVolume = event.target.value / 100;
            mainMusicPlayer.volume = musicVolume;
            saveSettings();
        });
        musicVolumeSlider.addEventListener('change', (event) => {
            musicVolume = event.target.value / 100;
            mainMusicPlayer.volume = musicVolume;
            saveSettings();
        });
    }

    if (clickToggleButton && clickSound && clickToggleImg) {
        clickToggleButton.addEventListener('click', () => {
            isClickSoundEnabled = !isClickSoundEnabled;
            setToggleImageSrc(clickToggleImg, isClickSoundEnabled, false, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover);
            if (isClickSoundEnabled) {
                clickSound.volume = clickVolume;
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.error("Click sound on toggle error:", e));
            }
            saveSettings();
        });
        clickToggleButton.addEventListener('mouseenter', () => setToggleImageSrc(clickToggleImg, isClickSoundEnabled, true, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover));
        clickToggleButton.addEventListener('mouseleave', () => setToggleImageSrc(clickToggleImg, isClickSoundEnabled, false, generalToggleImages.on, generalToggleImages.off, generalToggleImages.onHover, generalToggleImages.offHover));

    } else if (clickToggleButton) {
        clickToggleButton.disabled = true;
        if(clickToggleImg) clickToggleImg.alt = 'Click Sound N/A';
    }

    if (clickVolumeSlider && clickSound) {
        clickVolumeSlider.addEventListener('input', (event) => {
            clickVolume = event.target.value / 100;
            if (clickSound) clickSound.volume = clickVolume;
            saveSettings();
        });
        clickVolumeSlider.addEventListener('change', (event) => {
            clickVolume = event.target.value / 100;
            if (isClickSoundEnabled && clickSound) {
                clickSound.volume = clickVolume;
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.error("Click sound on slider change error:", e));
            }
            saveSettings();
        });
    } else if (clickVolumeSlider) {
        clickVolumeSlider.disabled = true;
    }

    if (themeToggleButton && themeToggleImg) {
        themeToggleButton.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            applyTheme();
            saveSettings();
        });
        themeToggleButton.addEventListener('mouseenter', () => setToggleImageSrc(themeToggleImg, isDarkMode, true, themeToggleImages.darkOn, themeToggleImages.darkOff, themeToggleImages.darkOnHover, themeToggleImages.darkOffHover));
        themeToggleButton.addEventListener('mouseleave', () => setToggleImageSrc(themeToggleImg, isDarkMode, false, themeToggleImages.darkOn, themeToggleImages.darkOff, themeToggleImages.darkOnHover, themeToggleImages.darkOffHover));
    }

    loadSettings();
});

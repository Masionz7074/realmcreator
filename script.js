document.addEventListener('DOMContentLoaded', () => {
    const clickSound = document.getElementById('minecraft-click');
    const mainMusicPlayer = document.getElementById('main-music-player');
    const settingsLinkNav = document.getElementById('settings-link-nav');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsButton = document.getElementById('close-settings');
    const musicToggle = document.getElementById('music-toggle');
    const musicVolumeSlider = document.getElementById('music-volume');
    const clickToggle = document.getElementById('click-toggle');
    const clickVolumeSlider = document.getElementById('click-volume');
    const prevSongButton = document.getElementById('prev-song');
    const nextSongButton = document.getElementById('next-song');

    const songPlaylist = [
        'sounds/mainmenu.mp3',
        'sounds/mainmenu1.mp3',
        'sounds/mainmenu2.mp3'
    ];
    let currentSongIndex = 0;
    let isMusicEnabled = true;
    let isClickSoundEnabled = true;
    let musicVolume = 0.5;
    let clickVolume = 1.0;
    let musicAttempted = false;

    const loadSong = (index) => {
        if (mainMusicPlayer && songPlaylist && songPlaylist[index]) {
            mainMusicPlayer.src = songPlaylist[index];
            mainMusicPlayer.volume = musicVolume;
            if (isMusicEnabled && musicAttempted) {
                mainMusicPlayer.play().catch(e => console.error("Error playing loaded song:", e));
            }
        }
    };

    const playNextSong = () => {
        currentSongIndex = (currentSongIndex + 1) % songPlaylist.length;
        loadSong(currentSongIndex);
    };

    const playPrevSong = () => {
        currentSongIndex = (currentSongIndex - 1 + songPlaylist.length) % songPlaylist.length;
        loadSong(currentSongIndex);
    };

    if (mainMusicPlayer) {
        mainMusicPlayer.addEventListener('ended', playNextSong);
    }

    if (prevSongButton) {
        prevSongButton.addEventListener('click', playPrevSong);
    }
    if (nextSongButton) {
        nextSongButton.addEventListener('click', playNextSong);
    }

    const loadSettings = () => {
        const savedMusicEnabled = localStorage.getItem('isMusicEnabled');
        if (savedMusicEnabled !== null) isMusicEnabled = savedMusicEnabled === 'true';
        musicToggle.textContent = isMusicEnabled ? 'On' : 'Off';
        musicToggle.setAttribute('data-state', isMusicEnabled ? 'on' : 'off');
        if (!isMusicEnabled && mainMusicPlayer && !mainMusicPlayer.paused) mainMusicPlayer.pause();

        const savedClickEnabled = localStorage.getItem('isClickSoundEnabled');
        if (savedClickEnabled !== null) isClickSoundEnabled = savedClickEnabled === 'true';
        clickToggle.textContent = isClickSoundEnabled ? 'On' : 'Off';
        clickToggle.setAttribute('data-state', isClickSoundEnabled ? 'on' : 'off');

        const savedMusicVolume = localStorage.getItem('musicVolume');
        if (savedMusicVolume !== null) {
            const parsed = parseFloat(savedMusicVolume);
            if (!isNaN(parsed)) musicVolume = parsed; else musicVolume = 0.5;
        }
        if (mainMusicPlayer) mainMusicPlayer.volume = musicVolume;
        musicVolumeSlider.value = musicVolume * 100;

        const savedClickVolume = localStorage.getItem('clickVolume');
        if (savedClickVolume !== null) {
            const parsed = parseFloat(savedClickVolume);
            if (!isNaN(parsed)) clickVolume = parsed; else clickVolume = 1.0;
        }
        clickVolumeSlider.value = clickVolume * 100;
    };

    const saveSettings = () => {
        localStorage.setItem('isMusicEnabled', isMusicEnabled);
        localStorage.setItem('isClickSoundEnabled', isClickSoundEnabled);
        localStorage.setItem('musicVolume', musicVolume);
        localStorage.setItem('clickVolume', clickVolume);
    };

    document.body.addEventListener('click', () => {
        if (!musicAttempted && isMusicEnabled && mainMusicPlayer && mainMusicPlayer.paused) {
            loadSong(currentSongIndex);
            mainMusicPlayer.play().then(() => {
                musicAttempted = true;
            }).catch(e => {
                console.error("Initial music play prevented:", e);
                musicAttempted = true;
            });
        }
    }, { once: true });

    const clickableElements = document.querySelectorAll('.clickable-element');
    clickableElements.forEach(element => {
        element.addEventListener('click', () => {
            if (isClickSoundEnabled && clickSound) {
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
            if (hash === '#home' || hash === '') {
                const homeSection = document.getElementById('home');
                if (homeSection) homeSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                const targetSection = document.querySelector(hash);
                if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    if (settingsLinkNav) {
        settingsLinkNav.addEventListener('click', (event) => {
            if (window.location.hash !== '#settings') {
                window.location.hash = '#settings';
            } else {
                openSettingsModal();
            }
            event.preventDefault();
        });
    }

    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', () => closeSettingsModal());
    }
    if (settingsModal) {
        settingsModal.addEventListener('click', (event) => {
            if (event.target === settingsModal) closeSettingsModal();
        });
    }

    if (musicToggle && mainMusicPlayer) {
        musicToggle.addEventListener('click', () => {
            isMusicEnabled = !isMusicEnabled;
            musicToggle.textContent = isMusicEnabled ? 'On' : 'Off';
            musicToggle.setAttribute('data-state', isMusicEnabled ? 'on' : 'off');
            if (isMusicEnabled) {
                if (mainMusicPlayer.paused) {
                    if(!musicAttempted){
                        musicAttempted = true;
                        loadSong(currentSongIndex);
                    } else {
                         mainMusicPlayer.play().catch(e => console.error("Error resuming music:", e));
                    }
                }
            } else {
                mainMusicPlayer.pause();
            }
            saveSettings();
        });
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

    if (clickToggle && clickSound) {
        clickToggle.addEventListener('click', () => {
            isClickSoundEnabled = !isClickSoundEnabled;
            clickToggle.textContent = isClickSoundEnabled ? 'On' : 'Off';
            clickToggle.setAttribute('data-state', isClickSoundEnabled ? 'on' : 'off');
            if (isClickSoundEnabled) {
                clickSound.volume = clickVolume;
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.error("Click sound on toggle error:", e));
            }
            saveSettings();
        });
    } else if (clickToggle) {
        clickToggle.disabled = true;
        clickToggle.textContent = 'N/A';
    }

    if (clickVolumeSlider && clickSound) {
        clickVolumeSlider.addEventListener('input', (event) => {
            clickVolume = event.target.value / 100;
            saveSettings();
        });
        clickVolumeSlider.addEventListener('change', (event) => {
            clickVolume = event.target.value / 100;
            if (isClickSoundEnabled) {
                clickSound.volume = clickVolume;
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.error("Click sound on slider change error:", e));
            }
            saveSettings();
        });
    } else if (clickVolumeSlider) {
        clickVolumeSlider.disabled = true;
    }

    loadSettings();
    if(mainMusicPlayer && songPlaylist.length > 0) {
        loadSong(currentSongIndex);
    }
});

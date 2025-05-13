document.addEventListener('DOMContentLoaded', () => {
    // Audio elements
    const clickSound = document.getElementById('minecraft-click');
    const mainMusic = document.getElementById('main-music');

    // Settings elements
    const settingsLink = document.getElementById('settings-link');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsButton = document.getElementById('close-settings');
    const musicToggle = document.getElementById('music-toggle');
    const musicVolumeSlider = document.getElementById('music-volume');
    const clickToggle = document.getElementById('click-toggle');
    const clickVolumeSlider = document.getElementById('click-volume');

    // State variables (initial state, will be updated by localStorage)
    // Default values if nothing is saved yet
    let isMusicEnabled = true;
    let isClickSoundEnabled = true;
    let musicVolume = 0.5; // 0.0 to 1.0
    let clickVolume = 1.0; // 0.0 to 1.0

    // --- Load Settings from localStorage ---
    const loadSettings = () => {
        const savedMusicEnabled = localStorage.getItem('isMusicEnabled');
        const savedClickEnabled = localStorage.getItem('isClickSoundEnabled');
        const savedMusicVolume = localStorage.getItem('musicVolume');
        const savedClickVolume = localStorage.getItem('clickVolume');

        // Apply music enabled state
        if (savedMusicEnabled !== null) {
            isMusicEnabled = savedMusicEnabled === 'true'; // localStorage stores boolean as string
        }
        musicToggle.textContent = isMusicEnabled ? 'On' : 'Off';
        // If music was disabled, ensure it's paused initially
        if (!isMusicEnabled && mainMusic && !mainMusic.paused) {
            mainMusic.pause();
        }


        // Apply click sound enabled state
        if (savedClickEnabled !== null) {
            isClickSoundEnabled = savedClickEnabled === 'true';
        }
        clickToggle.textContent = isClickSoundEnabled ? 'On' : 'Off';


        // Apply music volume
        if (savedMusicVolume !== null) {
            const parsedVolume = parseFloat(savedMusicVolume);
            if (!isNaN(parsedVolume)) { // Check if parsed value is a valid number
                musicVolume = parsedVolume;
            } else {
                musicVolume = 0.5; // Reset to default if invalid
            }
        }
         if (mainMusic) {
            mainMusic.volume = musicVolume; // Apply volume to audio element
         }
         musicVolumeSlider.value = musicVolume * 100; // Update slider position (0-100)


        // Apply click volume
        if (savedClickVolume !== null) {
             const parsedVolume = parseFloat(savedClickVolume);
             if (!isNaN(parsedVolume)) { // Check if parsed value is a valid number
                clickVolume = parsedVolume;
             } else {
                clickVolume = 1.0; // Reset to default if invalid
             }
        }
        // clickSound volume is applied just before playing
        clickVolumeSlider.value = clickVolume * 100; // Update slider position (0-100)

        console.log('Settings loaded:', {isMusicEnabled, isClickSoundEnabled, musicVolume, clickVolume}); // For debugging
    };

     // --- Save Settings to localStorage ---
    const saveSettings = () => {
        localStorage.setItem('isMusicEnabled', isMusicEnabled);
        localStorage.setItem('isClickSoundEnabled', isClickSoundEnabled);
        localStorage.setItem('musicVolume', musicVolume);
        localStorage.setItem('clickVolume', clickVolume);
         console.log('Settings saved:', {isMusicEnabled, isClickSoundEnabled, musicVolume, clickVolume}); // For debugging
    };


    // --- Background Music Autoplay (Modified) ---
    // Attempt to play music on first user interaction *unless* it's disabled
    // Using the 'once' option means this listener removes itself after the first trigger.
    let musicAttempted = false; // Flag to only attempt autoplay once by this mechanism

    document.body.addEventListener('click', () => {
        // Only attempt if music is enabled, the audio element exists, and it's currently paused
        if (!musicAttempted && isMusicEnabled && mainMusic && mainMusic.paused) {
             mainMusic.play().then(() => {
                console.log('Music started by user interaction');
                musicAttempted = true; // Mark attempt as successful or tried
            }).catch(error => {
                // Autoplay was prevented. User needs to interact more directly.
                console.log('Music autoplay prevented:', error);
                musicAttempted = true; // Mark attempt as tried even if failed
                 // You could add a visible "Play Music" button here if needed
            });
        }
    }, { once: true }); // Use { once: true } to remove the listener after the first click


     // --- Click Sound Effect ---
    // Add a class to elements that should make a click sound (e.g., nav links, buttons, modal controls)
    const clickableElements = document.querySelectorAll('.clickable-element');

    clickableElements.forEach(element => {
        element.addEventListener('click', (event) => {
            // Check if the click sound is enabled and the audio element exists before playing
            if (isClickSoundEnabled && clickSound) {

                // Optional: Prevent click sound for interactions within the modal content itself
                // if (event.target.closest('.modal-content') && event.target.id !== 'close-settings') return;

                // Set volume just before playing
                clickSound.volume = clickVolume;

                // Reset the sound to the beginning so it can be played multiple times quickly
                clickSound.currentTime = 0;
                clickSound.play().catch(error => {
                    console.log('Click sound playback prevented:', error);
                    // This might happen if the sound hasn't loaded or is blocked
                });
            }
        });
    });

    // --- Settings Modal Functionality ---

    // Open Modal
    if (settingsLink && settingsModal) {
        settingsLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            settingsModal.style.display = 'flex'; // Show the modal using flexbox for centering
        });
    }


    // Close Modal
    if (closeSettingsButton && settingsModal) {
        closeSettingsButton.addEventListener('click', () => {
            settingsModal.style.display = 'none'; // Hide the modal
        });

        // Close Modal by clicking outside the modal content
        settingsModal.addEventListener('click', (event) => {
            // Check if the click occurred directly on the overlay (not inside the modal-content)
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none'; // Hide the modal
            }
        });
    }


    // --- Settings Controls Functionality ---

    // Music Toggle
    if (musicToggle && mainMusic) {
        musicToggle.addEventListener('click', () => {
            isMusicEnabled = !isMusicEnabled; // Toggle state
            musicToggle.textContent = isMusicEnabled ? 'On' : 'Off'; // Update button text
            // Apply a data attribute or class for CSS styling the button differently
             musicToggle.setAttribute('data-state', isMusicEnabled ? 'on' : 'off');


            if (isMusicEnabled) {
                 // Attempt to play only if enabled AND music is currently paused
                 if (mainMusic.paused) {
                     mainMusic.play().catch(error => {
                         console.log('Failed to resume music:', error);
                         // This might fail if user hasn't interacted enough yet
                     });
                 }
            } else {
                mainMusic.pause(); // Pause if disabled
            }
            saveSettings(); // Save the new state
        });
    }


    // Music Volume Slider
    if (musicVolumeSlider && mainMusic) {
        musicVolumeSlider.addEventListener('input', (event) => {
            musicVolume = event.target.value / 100; // Convert 0-100 to 0.0-1.0
            mainMusic.volume = musicVolume; // Apply volume
            saveSettings(); // Save the new volume
        });
         // Also update volume on 'change' just in case 'input' isn't supported everywhere
         musicVolumeSlider.addEventListener('change', (event) => {
            musicVolume = event.target.value / 100;
            mainMusic.volume = musicVolume;
            saveSettings();
         });
    }


    // Click Sound Toggle
    if (clickToggle && clickSound) { // Ensure clickSound element exists
        clickToggle.addEventListener('click', () => {
            isClickSoundEnabled = !isClickSoundEnabled; // Toggle state
            clickToggle.textContent = isClickSoundEnabled ? 'On' : 'Off'; // Update button text
             // Apply a data attribute or class for CSS styling the button differently
            clickToggle.setAttribute('data-state', isClickSoundEnabled ? 'on' : 'off');


            // Play a click sound immediately when toggling ON, if enabled
            if (isClickSoundEnabled) { // Only play if toggled ON
                 clickSound.volume = clickVolume; // Use current click volume
                 clickSound.currentTime = 0;
                 clickSound.play().catch(error => console.log('Click sound on toggle play prevented:', error));
            }

            saveSettings(); // Save the new state
        });
    } else if (clickToggle) {
         // If click sound element doesn't exist, maybe disable the toggle
         clickToggle.disabled = true;
         clickToggle.textContent = 'N/A';
    }


    // Click Volume Slider
    if (clickVolumeSlider && clickSound) { // Ensure clickSound element exists
        clickVolumeSlider.addEventListener('input', (event) => {
            clickVolume = event.target.value / 100; // Convert 0-100 to 0.0-1.0
            // Volume is applied to clickSound *before* playing in the click handler
            saveSettings(); // Save the new volume

            // Optional: Play a preview sound while dragging the slider, if enabled
             if (isClickSoundEnabled) {
                 clickSound.volume = clickVolume; // Use the volume being set
                  // Don't reset currentTime here, let the 'change' event handle a clean play
                 // clickSound.currentTime = 0; // Avoid rapid re-starts while dragging
                 // clickSound.play().catch(error => console.log('Click sound on slider preview prevented:', error));
             }
        });
         // Play a preview sound when the user finishes dragging the slider, if enabled
         clickVolumeSlider.addEventListener('change', (event) => {
             if (isClickSoundEnabled) {
                 clickSound.volume = clickVolume; // Use the final volume
                  clickSound.currentTime = 0; // Reset for a clean play after drag
                  clickSound.play().catch(error => console.log('Click sound on slider change prevented:', error));
             }
         });
    } else if (clickVolumeSlider) {
        // If click sound element doesn't exist, maybe disable the slider
        clickVolumeSlider.disabled = true;
    }


    // --- Initial Load ---
    // Load settings from localStorage when the page first loads
    loadSettings();

    // Initial state update for toggle buttons based on loaded settings
    // Done inside loadSettings now, but good to ensure
     if(musicToggle) musicToggle.setAttribute('data-state', isMusicEnabled ? 'on' : 'off');
     if(clickToggle) clickToggle.setAttribute('data-state', isClickSoundEnabled ? 'on' : 'off');


});
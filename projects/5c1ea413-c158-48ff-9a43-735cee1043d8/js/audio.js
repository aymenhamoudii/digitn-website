/**
 * Snake Game - Audio Module
 * Web Audio API sound effects
 */

(function() {
    'use strict';

    var audioContext = null;
    var soundEnabled = true;
    var masterGain = null;

    /**
     * Initialize audio context
     */
    function initAudio() {
        if (audioContext) return;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioContext.createGain();
            masterGain.gain.value = 0.3;
            masterGain.connect(audioContext.destination);
        } catch (e) {
            console.warn('Web Audio API not supported');
            soundEnabled = false;
        }
    }

    /**
     * Resume audio context if suspended
     */
    function resumeAudioContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    /**
     * Play eat sound - cheerful blip
     */
    function playEatSound() {
        if (!soundEnabled || !audioContext) return;
        
        resumeAudioContext();
        
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Cheerful ascending tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }

    /**
     * Play game over sound - descending tone
     */
    function playGameOverSound() {
        if (!soundEnabled || !audioContext) return;
        
        resumeAudioContext();
        
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        // Descending sad tone
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.4); // A2
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    }

    /**
     * Play button click sound
     */
    function playClickSound() {
        if (!soundEnabled || !audioContext) return;
        
        resumeAudioContext();
        
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }

    /**
     * Toggle sound on/off
     */
    function toggleSound() {
        soundEnabled = !soundEnabled;
        
        var soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
        }
        
        if (soundEnabled) {
            initAudio();
            playClickSound();
        }
        
        return soundEnabled;
    }

    /**
     * Check if sound is enabled
     */
    function isSoundEnabled() {
        return soundEnabled;
    }

    /**
     * Set sound enabled state
     */
    function setSoundEnabled(enabled) {
        soundEnabled = enabled;
    }

    // Expose functions to window
    window.initAudio = initAudio;
    window.playEatSound = playEatSound;
    window.playGameOverSound = playGameOverSound;
    window.playClickSound = playClickSound;
    window.toggleSound = toggleSound;
    window.isSoundEnabled = isSoundEnabled;
    window.setSoundEnabled = setSoundEnabled;

})();
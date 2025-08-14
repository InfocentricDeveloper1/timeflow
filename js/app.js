/**
 * TimeFlow - Shell Architecture Implementation
 * Copyright (c) 2024 TimeFlow. All rights reserved.
 */

// Namespace for our app
window.TimeFlow = (function() {
    'use strict';

    // App state
    let state = {
        mode: 'timer',
        time: 0,
        isRunning: false,
        interval: null,
        laps: [],
        pomodoroPhase: 'work',
        pomodoroSession: 1,
        completedSessions: 0,
        settings: {
            pomodoro: {
                work: 25,
                shortBreak: 5,
                longBreak: 15,
                sessionsUntilLong: 4
            },
            sound: 'sine',
            volume: 0.3,
            theme: 'default'
        }
    };

    // Initialize the app
    function init() {
        console.log('TimeFlow: Initializing...');
        
        // Load saved settings
        loadSettings();
        
        // Build the UI
        buildUI();
        
        // Initialize event listeners
        initEventListeners();
        
        // Hide loader
        hideLoader();
        
        // Show the app
        showApp();
        
        console.log('TimeFlow: Initialization complete');
    }

    // Hide the loading spinner
    function hideLoader() {
        const loader = document.querySelector('.app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
        document.getElementById('app').classList.remove('app-loading');
    }

    // Build the entire UI dynamically
    function buildUI() {
        const app = document.getElementById('app');
        
        // Clear existing content except loader
        const loader = app.querySelector('.app-loader');
        app.innerHTML = '';
        if (loader) app.appendChild(loader);
        
        // Build main structure
        app.innerHTML += `
            <!-- Particles Background -->
            <div id="particles"></div>
            
            <!-- Main Container -->
            <div class="container">
                <h1>TimeFlow</h1>
                <p class="subtitle">Beautiful Time Tracking</p>
                
                <!-- Settings Button -->
                <button class="main-settings-btn" id="settingsBtn" title="Settings">⚙️</button>
                
                <!-- Mode Switcher -->
                <div class="mode-switcher">
                    <button class="mode-btn active" data-mode="timer">Timer</button>
                    <button class="mode-btn" data-mode="stopwatch">Stopwatch</button>
                    <button class="mode-btn" data-mode="pomodoro">Pomodoro</button>
                </div>
                
                <!-- Display -->
                <div class="display" id="display">00:00:00</div>
                
                <!-- Timer Inputs -->
                <div class="timer-inputs" id="timerInputs">
                    <div class="timer-input-group">
                        <input type="number" class="timer-input" id="hoursInput" min="0" max="23" value="0">
                        <label>HOURS</label>
                    </div>
                    <div class="timer-input-group">
                        <input type="number" class="timer-input" id="minutesInput" min="0" max="59" value="0">
                        <label>MINUTES</label>
                    </div>
                    <div class="timer-input-group">
                        <input type="number" class="timer-input" id="secondsInput" min="0" max="59" value="0">
                        <label>SECONDS</label>
                    </div>
                </div>
                
                <!-- Pomodoro Status -->
                <div class="pomodoro-status hidden" id="pomodoroStatus">
                    <div class="pomodoro-info">
                        <span id="pomodoroPhase">Work Session</span>
                        <span class="pomodoro-count">Session <span id="pomodoroCount">1</span> of 4</span>
                    </div>
                    <div class="pomodoro-dots" id="pomodoroDots"></div>
                </div>
                
                <!-- Controls -->
                <div class="controls">
                    <button class="btn btn-start" id="startBtn">START</button>
                    <button class="btn btn-pause hidden" id="pauseBtn">PAUSE</button>
                    <button class="btn btn-reset" id="resetBtn">RESET</button>
                    <button class="btn btn-lap hidden" id="lapBtn">LAP</button>
                    <button class="btn btn-skip hidden" id="skipBtn">SKIP</button>
                </div>
                
                <!-- Laps -->
                <div class="laps hidden" id="laps"></div>
            </div>
            
            <!-- Ad Container -->
            <div class="ad-container" id="adContainer">
                <div class="ad-wrapper">
                    <span class="ad-label">Advertisement</span>
                    <ins class="adsbygoogle"
                         style="display:inline-block;width:728px;height:90px"
                         data-ad-client="ca-pub-4722603000032628"
                         data-ad-slot="1234567890"></ins>
                </div>
            </div>
            
            <!-- Settings Modal -->
            <div class="settings-modal" id="settingsModal">
                <!-- Settings content will be built when opened -->
            </div>
            
            <!-- Legal Footer -->
            <div class="legal-footer">
                © 2024 TimeFlow • <a href="/terms.html">Terms</a> • <a href="/privacy.html">Privacy</a>
            </div>
        `;
        
        // Load additional styles
        loadStyles();
        
        // Initialize ad
        initializeAd();
    }

    // Load the rest of the styles dynamically
    function loadStyles() {
        const style = document.createElement('style');
        style.textContent = getFullStyles();
        document.head.appendChild(style);
    }

    // Initialize event listeners
    function initEventListeners() {
        // Mode switcher
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => switchMode(e.target.dataset.mode));
        });
        
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', start);
        document.getElementById('pauseBtn').addEventListener('click', pause);
        document.getElementById('resetBtn').addEventListener('click', reset);
        document.getElementById('lapBtn').addEventListener('click', lap);
        document.getElementById('skipBtn').addEventListener('click', skipPomodoro);
        document.getElementById('settingsBtn').addEventListener('click', toggleSettings);
        
        // Input validation
        ['hoursInput', 'minutesInput', 'secondsInput'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', validateInput);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }

    // Show the app
    function showApp() {
        // Initialize particles
        initParticles();
        
        // Show ad if not hidden
        if (!localStorage.getItem('adsHidden')) {
            document.getElementById('adContainer').classList.remove('hidden');
        }
    }

    // Load settings from localStorage
    function loadSettings() {
        const saved = localStorage.getItem('timeflowSettings');
        if (saved) {
            try {
                state.settings = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }

    // Get full styles (this would contain all the CSS from the original)
    function getFullStyles() {
        // This is a condensed version - in production, this would include all styles
        return `
            /* Container styles */
            .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 30px;
                padding: 40px;
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                border: 1px solid rgba(255, 255, 255, 0.18);
                max-width: 500px;
                width: 90%;
                position: relative;
                z-index: 10;
            }
            
            h1 {
                text-align: center;
                margin-bottom: 10px;
                font-size: 2.5em;
                font-weight: 700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .subtitle {
                text-align: center;
                margin-bottom: 30px;
                opacity: 0.9;
                font-size: 1.1em;
            }
            
            .main-settings-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                cursor: pointer;
                font-size: 16px;
                color: white;
            }
            
            .mode-switcher {
                display: flex;
                justify-content: center;
                margin-bottom: 30px;
                gap: 10px;
            }
            
            .mode-btn {
                padding: 12px 30px;
                border: none;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border-radius: 50px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .mode-btn.active {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }
            
            .display {
                font-size: 4em;
                text-align: center;
                margin: 40px 0;
                font-weight: 300;
                letter-spacing: 0.05em;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                font-family: 'Courier New', monospace;
                background: rgba(0, 0, 0, 0.2);
                padding: 20px;
                border-radius: 20px;
            }
            
            .timer-inputs {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .timer-input-group {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .timer-input {
                width: 80px;
                padding: 15px;
                font-size: 24px;
                text-align: center;
                border: none;
                border-radius: 15px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }
            
            .timer-input-group label {
                margin-top: 8px;
                font-size: 14px;
                opacity: 0.9;
            }
            
            .controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 15px 40px;
                border: none;
                border-radius: 50px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                color: white;
            }
            
            .btn-start {
                background: #4ade80;
                color: #1a1a1a;
            }
            
            .btn-pause {
                background: #fbbf24;
                color: #1a1a1a;
            }
            
            .btn-reset {
                background: #ef4444;
                color: white;
            }
            
            .btn-lap {
                background: #8b5cf6;
                color: white;
            }
            
            .btn-skip {
                background: #6366f1;
                color: white;
            }
            
            .ad-container {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
                padding: 10px;
                text-align: center;
            }
            
            .legal-footer {
                position: fixed;
                bottom: 5px;
                right: 10px;
                font-size: 10px;
                opacity: 0.3;
                color: rgba(255, 255, 255, 0.6);
                z-index: 10;
            }
            
            .legal-footer a {
                color: rgba(255, 255, 255, 0.6);
                text-decoration: none;
            }
            
            /* Particles */
            #particles {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }
        `;
    }

    // Timer functions
    function start() {
        console.log('Starting timer...');
    }

    function pause() {
        console.log('Pausing timer...');
    }

    function reset() {
        console.log('Resetting timer...');
    }

    function lap() {
        console.log('Recording lap...');
    }

    function skipPomodoro() {
        console.log('Skipping pomodoro session...');
    }

    function switchMode(mode) {
        console.log('Switching to mode:', mode);
        state.mode = mode;
        updateModeDisplay();
    }

    function toggleSettings() {
        console.log('Toggling settings...');
    }

    function validateInput(e) {
        const input = e.target;
        const max = parseInt(input.max);
        if (input.value > max) input.value = max;
        if (input.value < 0) input.value = 0;
    }

    function handleKeyboard(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            state.isRunning ? pause() : start();
        }
    }

    function updateModeDisplay() {
        // Update active mode button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === state.mode);
        });
    }

    function initParticles() {
        console.log('Initializing particles...');
    }

    function initializeAd() {
        // Initialize AdSense
        if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }

    // Public API
    return {
        init: init,
        getState: () => state
    };
})();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TimeFlow.init);
} else {
    TimeFlow.init();
}
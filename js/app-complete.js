/**
 * TimeFlow - Complete Timer Implementation
 * Copyright (c) 2024 TimeFlow. All rights reserved.
 */

window.TimeFlow = (function() {
    'use strict';

    // Timer state
    let mode = 'timer';
    let time = 0;
    let isRunning = false;
    let interval = null;
    let laps = [];
    
    // Pomodoro state
    let pomodoroPhase = 'work';
    let pomodoroSession = 1;
    let completedSessions = 0;
    let sessionsUntilLong = 4;
    const POMODORO_TIMES = {
        work: 1500,      // 25 minutes
        shortBreak: 300, // 5 minutes
        longBreak: 900   // 15 minutes
    };
    
    // Settings
    let selectedSound = 'sine';
    let soundVolume = 0.3;
    let mainSettingsChanged = false;
    let volumeDebounceTimer = null;
    
    // Modal promise resolver
    let modalResolver = null;

    // Initialize the app
    function init() {
        console.log('TimeFlow: Initializing...');
        
        // Build the UI
        buildUI();
        
        // Load settings
        loadSettings();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize particles
        initParticles();
        
        // Hide loader and show app
        hideLoader();
        showApp();
        
        console.log('TimeFlow: Ready!');
    }

    // Build the complete UI
    function buildUI() {
        const app = document.getElementById('app');
        app.innerHTML = getCompleteHTML();
        
        // Load all styles
        loadAllStyles();
    }

    // Get complete HTML structure
    function getCompleteHTML() {
        return `
            <!-- Particles Background -->
            <div id="particles"></div>
            
            <!-- Custom Modal -->
            <div class="modal-overlay" id="modalOverlay">
                <div class="modal">
                    <div class="modal-content">
                        <h2 class="modal-title" id="modalTitle">Confirmation</h2>
                        <p class="modal-message" id="modalMessage">Are you sure?</p>
                        <div class="modal-buttons" id="modalButtons">
                            <button class="modal-btn modal-btn-cancel" onclick="TimeFlow.closeModal(false)">Cancel</button>
                            <button class="modal-btn modal-btn-confirm" onclick="TimeFlow.closeModal(true)">Confirm</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Main Settings Modal -->
            <div class="main-settings-modal" id="mainSettingsModal">
                <div class="main-settings-content">
                    <button class="close-main-settings" onclick="TimeFlow.toggleMainSettings()">×</button>
                    
                    <div class="main-settings-header">
                        <h2>Settings</h2>
                        <p class="subtitle">Customize your TimeFlow experience</p>
                    </div>
                    
                    ${buildSettingsContent()}
                </div>
            </div>
            
            <!-- Main Container -->
            <div class="container">
                <h1>TimeFlow</h1>
                <p class="subtitle">Beautiful Time Tracking</p>
                
                <!-- Settings Button -->
                <button class="main-settings-btn" onclick="TimeFlow.toggleMainSettings()" title="Settings">⚙️</button>
                
                <!-- Mode Switcher -->
                <div class="mode-switcher">
                    <button class="mode-btn active" onclick="TimeFlow.switchMode('timer')">Timer</button>
                    <button class="mode-btn" onclick="TimeFlow.switchMode('stopwatch')">Stopwatch</button>
                    <button class="mode-btn" onclick="TimeFlow.switchMode('pomodoro')">Pomodoro</button>
                </div>
                
                <!-- Display -->
                <div class="display" id="display">00:00:00</div>
                
                <!-- Pomodoro Status -->
                <div class="pomodoro-status hidden" id="pomodoroStatus">
                    <div class="pomodoro-info">
                        <span id="pomodoroPhase">Work Session</span>
                        <span id="pomodoroCount">1 of 4</span>
                    </div>
                    <div class="pomodoro-dots">
                        <span class="dot active"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                </div>
                
                <!-- Timer Inputs -->
                <div class="timer-inputs" id="timerInputs">
                    <div class="timer-input-group">
                        <input type="number" class="timer-input" id="hoursInput" placeholder="00" min="0" max="99">
                        <span class="timer-label">Hours</span>
                    </div>
                    <div class="timer-input-group">
                        <input type="number" class="timer-input" id="minutesInput" placeholder="00" min="0" max="59">
                        <span class="timer-label">Minutes</span>
                    </div>
                    <div class="timer-input-group">
                        <input type="number" class="timer-input" id="secondsInput" placeholder="00" min="0" max="59">
                        <span class="timer-label">Seconds</span>
                    </div>
                </div>
                
                <!-- Controls -->
                <div class="controls">
                    <button class="control-btn start-btn" id="startBtn" onclick="TimeFlow.start()">Start</button>
                    <button class="control-btn pause-btn hidden" id="pauseBtn" onclick="TimeFlow.pause()">Pause</button>
                    <button class="control-btn reset-btn" onclick="TimeFlow.reset()">Reset</button>
                    <button class="control-btn lap-btn hidden" id="lapBtn" onclick="TimeFlow.lap()">Lap</button>
                    <button class="control-btn skip-btn hidden" id="skipBtn" onclick="TimeFlow.skipPomodoro()">Skip</button>
                </div>
                
                <!-- Laps -->
                <div class="laps hidden" id="laps"></div>
            </div>
            
            <!-- Ad Container -->
            <div class="ad-container hidden" id="adContainer">
                <div class="ad-wrapper">
                    <span class="ad-label">Advertisement</span>
                    <ins class="adsbygoogle"
                         style="display:inline-block;width:728px;height:90px"
                         data-ad-client="ca-pub-4722603000032628"
                         data-ad-slot="1234567890"></ins>
                </div>
            </div>
            
            <!-- Legal Footer -->
            <div class="legal-footer">
                © 2024 TimeFlow • <a href="terms.html">Terms</a> • <a href="privacy.html">Privacy</a>
            </div>
        `;
    }

    // Build settings content
    function buildSettingsContent() {
        return `
            <div class="settings-section">
                <h3>🍅 Pomodoro Settings</h3>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label>Work Duration</label>
                        <input type="number" id="mainWorkDuration" value="25" min="1" max="60" onchange="TimeFlow.autoSavePomodoroDurations()">
                        <span class="setting-unit">minutes</span>
                    </div>
                    <div class="setting-item">
                        <label>Short Break</label>
                        <input type="number" id="mainShortBreak" value="5" min="1" max="30" onchange="TimeFlow.autoSavePomodoroDurations()">
                        <span class="setting-unit">minutes</span>
                    </div>
                    <div class="setting-item">
                        <label>Long Break</label>
                        <input type="number" id="mainLongBreak" value="15" min="1" max="60" onchange="TimeFlow.autoSavePomodoroDurations()">
                        <span class="setting-unit">minutes</span>
                    </div>
                    <div class="setting-item">
                        <label>Sessions Until Long Break</label>
                        <input type="number" id="mainSessionsUntilLong" value="4" min="2" max="10" onchange="TimeFlow.autoSavePomodoroDurations()">
                        <span class="setting-unit">sessions</span>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>⏰ Timer Sound</h3>
                <div class="sound-options">
                    ${getSoundOptions()}
                </div>
            </div>
            
            <div class="settings-section">
                <h3>🔊 Volume</h3>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <input type="range" id="volumeSlider" min="0" max="100" value="30" 
                           oninput="TimeFlow.updateVolumeWithAutoSave(this.value)"
                           style="flex: 1; accent-color: #4ade80; height: 6px; cursor: pointer;">
                    <span id="volumeValue" style="min-width: 50px; text-align: right; font-weight: 600;">30%</span>
                </div>
            </div>
            
            <!-- Auto-save notification -->
            <div id="autoSaveNotification" style="margin-top: 20px; text-align: center; opacity: 0; transition: opacity 0.3s ease; color: #4ade80; font-weight: 500; font-size: 14px;">
                ✓ Settings saved automatically
            </div>
        `;
    }

    // Get sound options HTML
    function getSoundOptions() {
        const sounds = [
            { value: 'sine', name: 'Gentle Chime', desc: 'Soft, pleasant tone perfect for focus work' },
            { value: 'square', name: 'Digital Beep', desc: 'Clear, attention-grabbing alert' },
            { value: 'triangle', name: 'Soft Bell', desc: 'Warm, friendly notification' },
            { value: 'chime', name: 'Wind Chime', desc: 'Musical sequence with three ascending notes' },
            { value: 'bell', name: 'Church Bell', desc: 'Deep, resonant bell tone' },
            { value: 'none', name: 'Silent', desc: 'No sound (visual notification only)' }
        ];
        
        return sounds.map(sound => `
            <label class="sound-option">
                <input type="radio" name="timerSound" value="${sound.value}" 
                       ${sound.value === selectedSound ? 'checked' : ''} 
                       onchange="TimeFlow.changeSoundWithAutoSave('${sound.value}')">
                <div class="sound-info">
                    <div class="sound-name">${sound.name}</div>
                    <div class="sound-description">${sound.desc}</div>
                </div>
                ${sound.value !== 'none' ? 
                    `<button class="preview-btn" onclick="TimeFlow.previewSound('${sound.value}')">Preview</button>` : 
                    '<button class="preview-btn" disabled style="opacity: 0.5;">Preview</button>'}
            </label>
        `).join('');
    }

    // Timer core functions
    function start() {
        if (mode === 'timer' && time === 0) {
            const hours = parseInt(document.getElementById('hoursInput').value) || 0;
            const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
            const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
            
            time = hours * 3600 + minutes * 60 + seconds;
            
            if (time === 0) {
                customAlert('Please set a time first!');
                return;
            }
        } else if (mode === 'pomodoro' && time === 0) {
            time = POMODORO_TIMES[pomodoroPhase];
        }
        
        isRunning = true;
        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
        
        if (mode === 'stopwatch') {
            document.getElementById('lapBtn').classList.remove('hidden');
        }
        
        interval = setInterval(() => {
            if (mode === 'timer' || mode === 'pomodoro') {
                time--;
                if (time <= 0) {
                    time = 0;
                    pause();
                    playSound();
                    
                    if (mode === 'pomodoro') {
                        handlePomodoroComplete();
                    } else {
                        customAlert("Time's up!");
                    }
                }
            } else {
                time++;
            }
            updateDisplay();
        }, 1000);
    }

    function pause() {
        isRunning = false;
        clearInterval(interval);
        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('pauseBtn').classList.add('hidden');
    }

    function reset() {
        pause();
        time = 0;
        laps = [];
        updateDisplay();
        
        document.getElementById('hoursInput').value = '';
        document.getElementById('minutesInput').value = '';
        document.getElementById('secondsInput').value = '';
        document.getElementById('laps').innerHTML = '';
        document.getElementById('laps').classList.add('hidden');
        
        if (mode === 'pomodoro') {
            initPomodoro();
        }
    }

    function lap() {
        laps.push(time);
        const lapsContainer = document.getElementById('laps');
        lapsContainer.classList.remove('hidden');
        
        const lapDiv = document.createElement('div');
        lapDiv.className = 'lap-item';
        lapDiv.innerHTML = `
            <span>Lap ${laps.length}</span>
            <span>${formatTime(time)}</span>
        `;
        lapsContainer.insertBefore(lapDiv, lapsContainer.firstChild);
    }

    function switchMode(newMode) {
        reset();
        mode = newMode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        const timerInputs = document.getElementById('timerInputs');
        const lapBtn = document.getElementById('lapBtn');
        const laps = document.getElementById('laps');
        const pomodoroStatus = document.getElementById('pomodoroStatus');
        const skipBtn = document.getElementById('skipBtn');
        
        if (mode === 'timer') {
            timerInputs.classList.remove('hidden');
            lapBtn.classList.add('hidden');
            laps.classList.add('hidden');
            pomodoroStatus.classList.add('hidden');
            skipBtn.classList.add('hidden');
        } else if (mode === 'stopwatch') {
            timerInputs.classList.add('hidden');
            lapBtn.classList.remove('hidden');
            pomodoroStatus.classList.add('hidden');
            skipBtn.classList.add('hidden');
        } else if (mode === 'pomodoro') {
            timerInputs.classList.add('hidden');
            lapBtn.classList.add('hidden');
            laps.classList.add('hidden');
            pomodoroStatus.classList.remove('hidden');
            skipBtn.classList.remove('hidden');
            initPomodoro();
        }
    }

    // Pomodoro functions
    function initPomodoro() {
        pomodoroPhase = 'work';
        pomodoroSession = 1;
        completedSessions = 0;
        time = POMODORO_TIMES.work;
        updateDisplay();
        updatePomodoroDisplay();
    }

    function updatePomodoroDisplay() {
        const phaseText = pomodoroPhase === 'work' ? 'Work Session' : 
                         pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break';
        document.getElementById('pomodoroPhase').textContent = phaseText;
        document.getElementById('pomodoroCount').textContent = 
            pomodoroPhase === 'work' ? `${pomodoroSession} of ${sessionsUntilLong}` : 'Break Time';
        
        updatePomodoroDots();
    }

    function updatePomodoroDots() {
        const dotsContainer = document.querySelector('.pomodoro-dots');
        
        // Clear existing dots
        dotsContainer.innerHTML = '';
        
        // Create dots based on current sessionsUntilLong setting
        for (let i = 0; i < sessionsUntilLong; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            
            if (i < completedSessions) {
                dot.classList.add('completed');
            } else if (i === completedSessions && pomodoroPhase === 'work') {
                dot.classList.add('active');
            }
            
            dotsContainer.appendChild(dot);
        }
    }

    function handlePomodoroComplete() {
        if (pomodoroPhase === 'work') {
            completedSessions++;
            if (completedSessions >= sessionsUntilLong) {
                pomodoroPhase = 'longBreak';
                customAlert('Great job! Time for a long break!');
            } else {
                pomodoroPhase = 'shortBreak';
                customAlert('Work session complete! Time for a short break.');
            }
            pomodoroSession = completedSessions + 1;
        } else if (pomodoroPhase === 'shortBreak') {
            pomodoroPhase = 'work';
            customAlert("Break over! Let's get back to work.");
        } else if (pomodoroPhase === 'longBreak') {
            completedSessions = 0;
            pomodoroSession = 1;
            pomodoroPhase = 'work';
            customAlert('Long break over! Starting a new cycle.');
        }
        
        time = POMODORO_TIMES[pomodoroPhase];
        updateDisplay();
        updatePomodoroDisplay();
    }

    function skipPomodoro() {
        if (customConfirm('Are you sure you want to skip this session?')) {
            time = 0;
            pause();
            handlePomodoroComplete();
        }
    }

    // Display functions
    function updateDisplay() {
        document.getElementById('display').textContent = formatTime(time);
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Sound functions
    function playSound() {
        if (selectedSound === 'none') return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        switch (selectedSound) {
            case 'sine':
                playTone(audioContext, 880, 1, 'sine');
                break;
            case 'square':
                playTone(audioContext, 800, 0.2, 'square');
                setTimeout(() => playTone(audioContext, 800, 0.2, 'square'), 300);
                break;
            case 'triangle':
                playTone(audioContext, 600, 0.8, 'triangle');
                break;
            case 'chime':
                playChime(audioContext);
                break;
            case 'bell':
                playBell(audioContext);
                break;
        }
    }

    function playTone(audioContext, frequency, duration, type) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(soundVolume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    function playChime(audioContext) {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(audioContext, freq, 0.8, 'sine'), i * 300);
        });
    }

    function playBell(audioContext) {
        const fundamental = 200;
        const partials = [1, 2, 2.4, 3, 4.2];
        
        partials.forEach((partial, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(fundamental * partial, audioContext.currentTime);
            oscillator.type = 'sine';
            
            const amp = soundVolume * (1 / (i + 1));
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(amp, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 2);
        });
    }

    function previewSound(sound) {
        const temp = selectedSound;
        selectedSound = sound;
        playSound();
        selectedSound = temp;
    }

    function changeSound(sound) {
        selectedSound = sound;
        localStorage.setItem('selectedSound', sound);
    }
    
    function changeSoundWithAutoSave(sound) {
        selectedSound = sound;
        autoSaveSettings();
        showAutoSaveNotification();
    }

    function updateVolume(value) {
        soundVolume = value / 100;
        document.getElementById('volumeValue').textContent = value + '%';
        localStorage.setItem('soundVolume', soundVolume);
    }
    
    function updateVolumeWithAutoSave(value) {
        soundVolume = value / 100;
        document.getElementById('volumeValue').textContent = value + '%';
        
        // Debounce the auto-save to avoid saving too frequently while dragging
        if (volumeDebounceTimer) {
            clearTimeout(volumeDebounceTimer);
        }
        
        volumeDebounceTimer = setTimeout(() => {
            autoSaveSettings();
            showAutoSaveNotification();
        }, 300); // Wait 300ms after user stops adjusting
    }

    // Settings functions
    function toggleMainSettings() {
        const modal = document.getElementById('mainSettingsModal');
        modal.classList.toggle('active');
        
        if (modal.classList.contains('active')) {
            loadSettingsToUI();
        }
    }

    function markMainSettingsChanged() {
        mainSettingsChanged = true;
    }
    
    function autoSavePomodoroDurations() {
        autoSaveSettings();
        
        // Update current timer and display if in pomodoro mode
        if (mode === 'pomodoro') {
            // Update time only if not running (to avoid disrupting active sessions)
            if (!isRunning) {
                time = POMODORO_TIMES[pomodoroPhase];
                updateDisplay();
            }
            
            // Handle case where current session exceeds new sessionsUntilLong limit
            if (completedSessions >= sessionsUntilLong) {
                completedSessions = sessionsUntilLong - 1;
            }
            if (pomodoroSession > sessionsUntilLong) {
                pomodoroSession = sessionsUntilLong;
            }
            
            // Always update the pomodoro display to reflect new settings
            updatePomodoroDisplay();
        }
        
        showAutoSaveNotification();
    }
    
    function autoSaveSettings() {
        // Get current values from inputs
        const work = parseInt(document.getElementById('mainWorkDuration').value);
        const shortBreak = parseInt(document.getElementById('mainShortBreak').value);
        const longBreak = parseInt(document.getElementById('mainLongBreak').value);
        sessionsUntilLong = parseInt(document.getElementById('mainSessionsUntilLong').value);
        
        // Update POMODORO_TIMES
        POMODORO_TIMES.work = work * 60;
        POMODORO_TIMES.shortBreak = shortBreak * 60;
        POMODORO_TIMES.longBreak = longBreak * 60;
        
        // Save to localStorage
        const settings = {
            pomodoro: { work, shortBreak, longBreak, sessionsUntilLong },
            sound: selectedSound,
            volume: soundVolume
        };
        
        localStorage.setItem('timeflowSettings', JSON.stringify(settings));
        mainSettingsChanged = false;
    }
    
    function showAutoSaveNotification() {
        const notification = document.getElementById('autoSaveNotification');
        if (notification) {
            notification.style.opacity = '1';
            
            // Hide after 2 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
            }, 2000);
        }
    }

    function saveAllSettings() {
        // Save Pomodoro settings
        const work = parseInt(document.getElementById('mainWorkDuration').value);
        const shortBreak = parseInt(document.getElementById('mainShortBreak').value);
        const longBreak = parseInt(document.getElementById('mainLongBreak').value);
        sessionsUntilLong = parseInt(document.getElementById('mainSessionsUntilLong').value);
        
        POMODORO_TIMES.work = work * 60;
        POMODORO_TIMES.shortBreak = shortBreak * 60;
        POMODORO_TIMES.longBreak = longBreak * 60;
        
        const settings = {
            pomodoro: { work, shortBreak, longBreak, sessionsUntilLong },
            sound: selectedSound,
            volume: soundVolume
        };
        
        localStorage.setItem('timeflowSettings', JSON.stringify(settings));
        mainSettingsChanged = false;
        
        // Update current timer and display if in pomodoro mode
        if (mode === 'pomodoro') {
            // Update time only if not running (to avoid disrupting active sessions)
            if (!isRunning) {
                time = POMODORO_TIMES[pomodoroPhase];
                updateDisplay();
            }
            
            // Handle case where current session exceeds new sessionsUntilLong limit
            if (completedSessions >= sessionsUntilLong) {
                completedSessions = sessionsUntilLong - 1;
            }
            if (pomodoroSession > sessionsUntilLong) {
                pomodoroSession = sessionsUntilLong;
            }
            
            // Always update the pomodoro display to reflect new settings
            updatePomodoroDisplay();
        }
        
        customAlert('Settings saved successfully!');
        toggleMainSettings();
    }

    function loadSettings() {
        const saved = localStorage.getItem('timeflowSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                
                // Load Pomodoro settings
                if (settings.pomodoro) {
                    POMODORO_TIMES.work = settings.pomodoro.work * 60;
                    POMODORO_TIMES.shortBreak = settings.pomodoro.shortBreak * 60;
                    POMODORO_TIMES.longBreak = settings.pomodoro.longBreak * 60;
                    sessionsUntilLong = settings.pomodoro.sessionsUntilLong || 4;
                }
                
                // Load sound settings
                if (settings.sound) selectedSound = settings.sound;
                if (settings.volume !== undefined) soundVolume = settings.volume;
                
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }

    function loadSettingsToUI() {
        // Load Pomodoro settings
        document.getElementById('mainWorkDuration').value = Math.round(POMODORO_TIMES.work / 60);
        document.getElementById('mainShortBreak').value = Math.round(POMODORO_TIMES.shortBreak / 60);
        document.getElementById('mainLongBreak').value = Math.round(POMODORO_TIMES.longBreak / 60);
        document.getElementById('mainSessionsUntilLong').value = sessionsUntilLong;
        
        // Load sound settings
        document.querySelector(`input[name="timerSound"][value="${selectedSound}"]`).checked = true;
        document.getElementById('volumeSlider').value = soundVolume * 100;
        document.getElementById('volumeValue').textContent = Math.round(soundVolume * 100) + '%';
    }

    // Modal functions
    function customAlert(message) {
        return showModal('Notice', message, false);
    }

    function customConfirm(message) {
        return showModal('Confirmation', message, true);
    }

    function showModal(title, message, isConfirm) {
        return new Promise(resolve => {
            const overlay = document.getElementById('modalOverlay');
            const titleEl = document.getElementById('modalTitle');
            const messageEl = document.getElementById('modalMessage');
            const buttonsEl = document.getElementById('modalButtons');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            if (isConfirm) {
                buttonsEl.innerHTML = `
                    <button class="modal-btn modal-btn-cancel" onclick="TimeFlow.closeModal(false)">Cancel</button>
                    <button class="modal-btn modal-btn-confirm" onclick="TimeFlow.closeModal(true)">Confirm</button>
                `;
            } else {
                buttonsEl.innerHTML = `
                    <button class="modal-btn modal-btn-confirm" onclick="TimeFlow.closeModal(true)">OK</button>
                `;
            }
            
            modalResolver = resolve;
            overlay.classList.add('active');
        });
    }

    function closeModal(result) {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('active');
        
        if (modalResolver) {
            modalResolver(result);
            modalResolver = null;
        }
    }

    // Utility functions
    function hideLoader() {
        const loader = document.querySelector('.app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
        document.getElementById('app').classList.remove('app-loading');
    }

    function showApp() {
        // Show ad if not hidden
        if (!localStorage.getItem('adsHidden')) {
            document.getElementById('adContainer').classList.remove('hidden');
            document.body.classList.add('ad-visible');
            
            // Initialize AdSense
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        }
    }

    function initEventListeners() {
        // Input validation
        document.getElementById('hoursInput').addEventListener('input', function(e) {
            if (e.target.value > 99) e.target.value = 99;
            if (e.target.value < 0) e.target.value = 0;
        });
        
        document.getElementById('minutesInput').addEventListener('input', function(e) {
            if (e.target.value > 59) e.target.value = 59;
            if (e.target.value < 0) e.target.value = 0;
        });
        
        document.getElementById('secondsInput').addEventListener('input', function(e) {
            if (e.target.value > 59) e.target.value = 59;
            if (e.target.value < 0) e.target.value = 0;
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space') {
                e.preventDefault();
                isRunning ? pause() : start();
            } else if (e.code === 'KeyR') {
                reset();
            } else if (e.code === 'KeyL' && mode === 'stopwatch' && isRunning) {
                lap();
            }
        });
    }

    function initParticles() {
        const container = document.querySelector('.container');
        const particles = document.getElementById('particles');
        
        setInterval(() => {
            if (document.querySelectorAll('.particle').length < 30) {
                createParticle();
            }
        }, 300);
    }

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const container = document.querySelector('.container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const side = Math.floor(Math.random() * 4);
        
        let x, y;
        switch (side) {
            case 0: // top
                x = rect.left + Math.random() * rect.width;
                y = rect.top;
                break;
            case 1: // right
                x = rect.right;
                y = rect.top + Math.random() * rect.height;
                break;
            case 2: // bottom
                x = rect.left + Math.random() * rect.width;
                y = rect.bottom;
                break;
            case 3: // left
                x = rect.left;
                y = rect.top + Math.random() * rect.height;
                break;
        }
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Set animation direction and drift
        if (side === 1 || side === 3) {
            particle.setAttribute('data-direction', 'right');
            const driftX = side === 1 ? (Math.random() * 100 + 50) : (-Math.random() * 100 - 50);
            const driftY = (Math.random() - 0.5) * 200;
            particle.style.setProperty('--driftX', driftX + 'px');
            particle.style.setProperty('--driftY', driftY + 'px');
        } else {
            const drift = (Math.random() - 0.5) * 100;
            particle.style.setProperty('--drift', drift + 'px');
        }
        
        document.getElementById('particles').appendChild(particle);
        
        particle.addEventListener('animationend', () => particle.remove());
    }

    function loadAllStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/complete-styles.css?v=' + Date.now();
        document.head.appendChild(link);
    }

    // Public API
    return {
        init: init,
        start: start,
        pause: pause,
        reset: reset,
        lap: lap,
        switchMode: switchMode,
        skipPomodoro: skipPomodoro,
        toggleMainSettings: toggleMainSettings,
        markMainSettingsChanged: markMainSettingsChanged,
        saveAllSettings: saveAllSettings,
        previewSound: previewSound,
        changeSound: changeSound,
        changeSoundWithAutoSave: changeSoundWithAutoSave,
        updateVolume: updateVolume,
        updateVolumeWithAutoSave: updateVolumeWithAutoSave,
        autoSavePomodoroDurations: autoSavePomodoroDurations,
        closeModal: closeModal,
        customAlert: customAlert,
        customConfirm: customConfirm
    };
})();

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TimeFlow.init);
} else {
    TimeFlow.init();
}
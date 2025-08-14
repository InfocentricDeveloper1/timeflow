// Import styles
import './styles.css';

// TimeFlow Timer Application
// Copyright (c) 2024 TimeFlow. All rights reserved.

// Initialize app only after DOM is ready
function initializeApp() {
    // Remove loader
    const loader = document.querySelector('.app-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
    
    // Build the app UI dynamically
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = buildAppHTML();
    
    // Initialize particles after container is ready
    setTimeout(() => {
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            createParticles();
        }
    }, 100);
    
    // Initialize the app logic
    initializeTimerLogic();
}

// Build the HTML structure dynamically
function buildAppHTML() {
    return `
        <div id="particles"></div>
        
        <!-- Custom Modal -->
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal-content">
                <h3 id="modalTitle"></h3>
                <p id="modalMessage"></p>
                <div class="modal-buttons" id="modalButtons"></div>
            </div>
        </div>
        
        <!-- Main Settings Modal -->
        <div class="main-settings-modal" id="mainSettingsModal">
            ${buildSettingsModal()}
        </div>
        
        <div class="container">
            <h1>TimeFlow</h1>
            <p class="subtitle">Beautiful Time Tracking</p>
            
            <button class="main-settings-btn" onclick="toggleMainSettings()" title="Settings">⚙️</button>
            
            ${buildModeSwitcher()}
            
            <div class="display" id="display">00:00:00</div>
            
            ${buildPomodoroStatus()}
            ${buildTimerInputs()}
            ${buildControls()}
            
            <div class="laps hidden" id="laps"></div>
        </div>
        
        ${buildAdContainer()}
    `;
}

function buildSettingsModal() {
    return `
        <div class="main-settings-content">
            <button class="close-main-settings" onclick="toggleMainSettings()">×</button>
            
            <div class="main-settings-header">
                <h2>Settings</h2>
                <p class="subtitle">Customize your TimeFlow experience</p>
            </div>
            
            ${buildPomodoroSettings()}
            ${buildSoundSettings()}
            ${buildVolumeSettings()}
            
            <div style="margin-top: 20px; text-align: center; color: rgba(255,255,255,0.6); font-size: 14px;">
                <i>Settings save automatically</i>
            </div>
        </div>
    `;
}

function buildPomodoroSettings() {
    return `
        <div class="settings-section">
            <h3>🍅 Pomodoro Settings</h3>
            <div class="settings-grid">
                <div class="setting-item">
                    <label>Work Duration</label>
                    <input type="number" id="mainWorkDuration" value="25" min="1" max="60" oninput="markMainSettingsChanged()">
                    <span class="setting-unit">minutes</span>
                </div>
                <div class="setting-item">
                    <label>Short Break</label>
                    <input type="number" id="mainShortBreak" value="5" min="1" max="30" oninput="markMainSettingsChanged()">
                    <span class="setting-unit">minutes</span>
                </div>
                <div class="setting-item">
                    <label>Long Break</label>
                    <input type="number" id="mainLongBreak" value="15" min="1" max="60" oninput="markMainSettingsChanged()">
                    <span class="setting-unit">minutes</span>
                </div>
                <div class="setting-item">
                    <label>Sessions Until Long Break</label>
                    <input type="number" id="mainSessionsUntilLong" value="4" min="2" max="10" oninput="markMainSettingsChanged()">
                    <span class="setting-unit">sessions</span>
                </div>
            </div>
        </div>
    `;
}

function buildSoundSettings() {
    const sounds = [
        { value: 'sine', name: 'Gentle Chime', desc: 'Soft, pleasant tone perfect for focus work' },
        { value: 'square', name: 'Digital Beep', desc: 'Clear, attention-grabbing alert' },
        { value: 'triangle', name: 'Soft Bell', desc: 'Mellow, calming notification' },
        { value: 'chime', name: 'Wind Chime', desc: 'Natural, harmonious sequence' },
        { value: 'bell', name: 'Church Bell', desc: 'Deep, resonant tone' },
        { value: 'none', name: 'Silent', desc: 'No sound notification' }
    ];
    
    return `
        <div class="settings-section">
            <h3>⏰ Timer Sound</h3>
            <div class="sound-options">
                ${sounds.map(sound => `
                    <label class="sound-option">
                        <input type="radio" name="timerSound" value="${sound.value}" ${sound.value === 'sine' ? 'checked' : ''}>
                        <div class="sound-info">
                            <div class="sound-name">${sound.name}</div>
                            <div class="sound-description">${sound.desc}</div>
                        </div>
                        ${sound.value !== 'none' ? `<button class="preview-btn" onclick="previewSound('${sound.value}')">Preview</button>` : ''}
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function buildVolumeSettings() {
    return `
        <div class="settings-section">
            <h3>🔊 Volume</h3>
            <div style="display: flex; align-items: center; gap: 20px;">
                <input type="range" id="volumeSlider" min="0" max="100" value="30" 
                       style="flex: 1; accent-color: #4ade80; height: 6px; cursor: pointer;">
                <span id="volumeValue" style="min-width: 50px; text-align: right; font-weight: 600;">30%</span>
            </div>
        </div>
    `;
}

function buildModeSwitcher() {
    return `
        <div class="mode-switcher">
            <button class="mode-btn active" onclick="switchMode('timer')">Timer</button>
            <button class="mode-btn" onclick="switchMode('stopwatch')">Stopwatch</button>
            <button class="mode-btn" onclick="switchMode('pomodoro')">Pomodoro</button>
        </div>
    `;
}

function buildPomodoroStatus() {
    return `
        <div class="pomodoro-status hidden" id="pomodoroStatus">
            <div class="pomodoro-info">
                <span id="pomodoroPhase">Work Session</span>
                <span class="pomodoro-count">Session <span id="pomodoroCount">1</span> of 4</span>
            </div>
            <div class="pomodoro-dots">
                <span class="dot active"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
    `;
}

function buildTimerInputs() {
    return `
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
    `;
}

function buildControls() {
    return `
        <div class="controls">
            <button class="btn btn-start" id="startBtn" onclick="start()">START</button>
            <button class="btn btn-pause hidden" id="pauseBtn" onclick="pause()">PAUSE</button>
            <button class="btn btn-reset" id="resetBtn" onclick="reset()">RESET</button>
            <button class="btn btn-lap hidden" id="lapBtn" onclick="lap()">LAP</button>
            <button class="btn btn-skip hidden" id="skipBtn" onclick="skipPomodoro()">SKIP</button>
        </div>
    `;
}

function buildAdContainer() {
    return `
        <div class="ad-container" id="adContainer">
            <div class="ad-wrapper">
                <span class="ad-label">Advertisement</span>
                <ins class="adsbygoogle"
                     style="display:inline-block;width:728px;height:90px"
                     data-ad-client="ca-pub-4722603000032628"
                     data-ad-slot="1234567890"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>
        </div>
    `;
}

// Initialize timer logic
function initializeTimerLogic() {
        
        // Console copyright warning
        console.log('%c⚠️ STOP! TimeFlow Timer - Proprietary Software', 'color: red; font-size: 30px; font-weight: bold;');
        console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is likely a scam.', 'color: red; font-size: 16px;');
        console.log('%cCopyright (c) 2024 TimeFlow. All rights reserved.', 'color: red; font-weight: bold;');
        console.log('%cUnauthorized access, modification, or distribution is prohibited.', 'color: red;');
        
        // Domain restriction and anti-theft protection
        (function() {
            const allowedDomains = [
                'timeflow.live',
                'www.timeflow.live',
                'localhost',
                '127.0.0.1',
                '0.0.0.0',
                'github.io',  // For GitHub Pages testing
                'githubusercontent.com'  // For GitHub raw view
            ];
            
            const currentDomain = window.location.hostname;
            
            // Allow file:// protocol for local development
            const isFileProtocol = window.location.protocol === 'file:';
            const isLocalIP = /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(currentDomain);
            const isAllowed = isFileProtocol || isLocalIP || 
                allowedDomains.some(domain => 
                    currentDomain === domain || currentDomain.endsWith('.' + domain)
                );
            
            if (!isAllowed) {
                document.body.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        color: white;
                        text-align: center;
                        padding: 20px;
                    ">
                        <div style="
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(10px);
                            border-radius: 20px;
                            padding: 40px;
                            max-width: 500px;
                            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                        ">
                            <h1 style="font-size: 3em; margin-bottom: 20px;">🚫</h1>
                            <h2 style="font-size: 2em; margin-bottom: 20px;">Unauthorized Access</h2>
                            <p style="font-size: 1.2em; margin-bottom: 30px;">
                                This application is protected by copyright law and is being used without authorization.
                            </p>
                            <p style="font-size: 1em; opacity: 0.8; margin-bottom: 20px;">
                                The genuine TimeFlow Timer is available at:
                            </p>
                            <a href="https://timeflow.live" style="
                                display: inline-block;
                                padding: 15px 30px;
                                background: rgba(74, 222, 128, 0.3);
                                color: white;
                                text-decoration: none;
                                border-radius: 50px;
                                font-size: 1.1em;
                                transition: all 0.3s ease;
                            ">Visit Official TimeFlow</a>
                            <p style="font-size: 0.9em; margin-top: 30px; opacity: 0.7;">
                                Legal inquiries: legal@timeflow.live
                            </p>
                        </div>
                    </div>
                `;
                
                // Log unauthorized access attempt
                console.error('Unauthorized domain access:', currentDomain);
                
                // Stop all timer functionality
                return;
            }
        })();
        
        let mode = 'timer';
        let interval = null;
        let time = 0;
        let isRunning = false;
        let laps = [];
        let modalCallback = null;
        
        // Pomodoro variables
        let pomodoroPhase = 'work'; // 'work', 'shortBreak', 'longBreak'
        let pomodoroCount = 1;
        let completedPomodoros = 0;
        let sessionsUntilLongBreak = 4;
        let POMODORO_TIMES = {
            work: 25 * 60,        // 25 minutes default
            shortBreak: 5 * 60,   // 5 minutes default
            longBreak: 15 * 60    // 15 minutes default
        };
        let pomodoroSettingsChanged = false;
        
        // Sound settings
        let selectedSound = 'sine';
        let soundVolume = 0.3;

        // Load saved settings if they exist
        function loadPomodoroSettings() {
            const saved = localStorage.getItem('pomodoroSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                POMODORO_TIMES.work = settings.work * 60;
                POMODORO_TIMES.shortBreak = settings.shortBreak * 60;
                POMODORO_TIMES.longBreak = settings.longBreak * 60;
                sessionsUntilLongBreak = settings.sessionsUntilLong;
                
                // Update input values
                document.getElementById('workDuration').value = settings.work;
                document.getElementById('shortBreakDuration').value = settings.shortBreak;
                document.getElementById('longBreakDuration').value = settings.longBreak;
                document.getElementById('sessionsUntilLong').value = settings.sessionsUntilLong;
            }
        }

        // Save settings
        function savePomodoroSettings() {
            const work = parseInt(document.getElementById('workDuration').value);
            const shortBreak = parseInt(document.getElementById('shortBreakDuration').value);
            const longBreak = parseInt(document.getElementById('longBreakDuration').value);
            const sessions = parseInt(document.getElementById('sessionsUntilLong').value);
            
            const settings = {
                work: work,
                shortBreak: shortBreak,
                longBreak: longBreak,
                sessionsUntilLong: sessions
            };
            
            // Note: localStorage won't work in Claude artifacts, but would work in production
            try {
                localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
            } catch (e) {
                // Ignore localStorage errors in artifact environment
            }
            
            POMODORO_TIMES.work = work * 60;
            POMODORO_TIMES.shortBreak = shortBreak * 60;
            POMODORO_TIMES.longBreak = longBreak * 60;
            sessionsUntilLongBreak = sessions;
            
            // Update dots if sessions changed
            updatePomodoroDots();
            
            // Reset timer with new settings if in pomodoro mode
            if (mode === 'pomodoro' && !isRunning) {
                time = POMODORO_TIMES[pomodoroPhase];
                updateDisplay();
            }
            
            // Reset change flag
            pomodoroSettingsChanged = false;
            
            // Hide settings
            // Pomodoro settings now in main settings
            
            // Show generic success message
            customAlert('Settings saved successfully!');
        }

        // Deprecated - Pomodoro settings now in main settings
        function togglePomodoroSettings() {
            // Open main settings instead
            toggleMainSettings();
        }
        
        // Track settings changes
        function markPomodoroSettingsChanged() {
            pomodoroSettingsChanged = true;
        }
        
        // Check for unsaved changes and handle them
        async function checkAndHandleUnsavedSettings() {
            // Check if main settings have unsaved changes
            const settings = document.getElementById('mainSettingsModal');
            
            // If settings are not open or no changes, return true to continue
            if (settings.classList.contains('hidden') || !pomodoroSettingsChanged) {
                return true;
            }
            
            // Show confirmation dialog
            const shouldSave = await customConfirm('You have unsaved settings. Would you like to save them before continuing?');
            
            if (shouldSave === null || shouldSave === false) {
                // User cancelled - keep settings open and don't proceed with action
                return false;
            }
            
            // User confirmed - save settings and close panel
            savePomodoroSettings();
            settings.classList.add('hidden');
            pomodoroSettingsChanged = false;
            
            return true;
        }

        function updatePomodoroDots() {
            const dotsContainer = document.querySelector('.pomodoro-dots');
            dotsContainer.innerHTML = '';
            
            for (let i = 0; i < sessionsUntilLongBreak; i++) {
                const dot = document.createElement('span');
                dot.className = 'dot';
                if (i < completedPomodoros) {
                    dot.classList.add('completed');
                } else if (i === completedPomodoros && pomodoroPhase === 'work') {
                    dot.classList.add('active');
                }
                dotsContainer.appendChild(dot);
            }
        }

        // Create floating particles around the container
        function createParticles() {
            const container = document.querySelector('.container');
            const particlesContainer = document.getElementById('particles');
            
            // Create particles that emit from the container edges
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
            const rect = container.getBoundingClientRect();
            
            // Randomly choose which edge to emit from
            const edge = Math.floor(Math.random() * 4);
            let startX, startY;
            
            switch(edge) {
                case 0: // Top edge
                    startX = rect.left + Math.random() * rect.width;
                    startY = rect.top;
                    particle.style.setProperty('--drift', (Math.random() - 0.5) * 100 + 'px');
                    particle.style.animation = 'floatUp 6s ease-out forwards';
                    break;
                case 1: // Right edge
                    startX = rect.right;
                    startY = rect.top + Math.random() * rect.height;
                    particle.style.setProperty('--driftX', Math.random() * 100 + 50 + 'px');
                    particle.style.setProperty('--driftY', (Math.random() - 0.5) * 200 + 'px');
                    particle.style.animation = 'floatSide 6s ease-out forwards';
                    break;
                case 2: // Bottom edge
                    startX = rect.left + Math.random() * rect.width;
                    startY = rect.bottom;
                    particle.style.setProperty('--drift', (Math.random() - 0.5) * 100 + 'px');
                    particle.style.animation = 'floatUp 6s ease-out forwards';
                    break;
                case 3: // Left edge
                    startX = rect.left;
                    startY = rect.top + Math.random() * rect.height;
                    particle.style.setProperty('--driftX', Math.random() * -100 - 50 + 'px');
                    particle.style.setProperty('--driftY', (Math.random() - 0.5) * 200 + 'px');
                    particle.style.animation = 'floatSide 6s ease-out forwards';
                    break;
            }
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            document.getElementById('particles').appendChild(particle);
            
            // Remove particle after animation
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }

        // Initialize particles after a short delay to ensure container is rendered
        setTimeout(createParticles, 100);
        
        // Load saved Pomodoro settings on startup
        loadPomodoroSettings();
        
        // Initialize auto-save features
        initializeSoundSelection();
        initializeVolumeControl();
        
        // New function to load Pomodoro settings into main settings modal
        function loadPomodoroSettingsToMain() {
            document.getElementById('mainWorkDuration').value = Math.round(POMODORO_TIMES.work / 60);
            document.getElementById('mainShortBreak').value = Math.round(POMODORO_TIMES.shortBreak / 60);
            document.getElementById('mainLongBreak').value = Math.round(POMODORO_TIMES.longBreak / 60);
            document.getElementById('mainSessionsUntilLong').value = sessionsUntilLongBreak;
        }
        
        // Save Pomodoro settings from main settings modal
        function savePomodoroSettingsFromMain() {
            const work = parseInt(document.getElementById('mainWorkDuration').value);
            const shortBreak = parseInt(document.getElementById('mainShortBreak').value);
            const longBreak = parseInt(document.getElementById('mainLongBreak').value);
            const sessions = parseInt(document.getElementById('mainSessionsUntilLong').value);
            
            console.log('Saving settings:', { work, shortBreak, longBreak, sessions });
            
            // Validation
            if (work < 1 || work > 60 || shortBreak < 1 || shortBreak > 30 || 
                longBreak < 1 || longBreak > 60 || sessions < 2 || sessions > 10) {
                console.log('Invalid values, not saving');
                // Don't save invalid values
                return;
            }
            
            // Save to localStorage
            const settings = {
                work: work,
                shortBreak: shortBreak,
                longBreak: longBreak,
                sessionsUntilLong: sessions
            };
            
            try {
                localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
            } catch (e) {
                // Ignore localStorage errors
            }
            
            // Update the global values
            POMODORO_TIMES.work = work * 60;
            POMODORO_TIMES.shortBreak = shortBreak * 60;
            POMODORO_TIMES.longBreak = longBreak * 60;
            sessionsUntilLongBreak = sessions;
            
            // If in Pomodoro mode and timer is stopped, update the display
            if (mode === 'pomodoro' && !isRunning) {
                time = POMODORO_TIMES[pomodoroPhase];
                updateDisplay();
            }
            
            // Success message shown by saveAllSettings
        }
        
        // Track changes in main settings
        let mainSettingsChanged = false;
        let autoSaveTimeout = null;
        
        function markMainSettingsChanged() {
            console.log('Settings changed, triggering auto-save...');
            mainSettingsChanged = true;
            
            // Auto-save after 1 second of no changes
            if (autoSaveTimeout) {
                clearTimeout(autoSaveTimeout);
            }
            
            autoSaveTimeout = setTimeout(() => {
                console.log('Auto-saving settings...');
                autoSaveSettings();
            }, 1000);
        }
        
        // Auto-save settings without closing modal
        function autoSaveSettings() {
            // Save Pomodoro settings
            savePomodoroSettingsFromMain();
            
            // Show subtle save indicator
            showSaveIndicator();
            
            // Reset change flag
            mainSettingsChanged = false;
        }
        
        // Show save indicator
        function showSaveIndicator() {
            // Create or get indicator
            let indicator = document.getElementById('saveIndicator');
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'saveIndicator';
                indicator.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(74, 222, 128, 0.9);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 14px;
                    z-index: 3000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                indicator.textContent = '✓ Saved';
                document.body.appendChild(indicator);
            }
            
            // Show indicator
            setTimeout(() => indicator.style.opacity = '1', 10);
            
            // Hide after 2 seconds
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }, 2000);
        }
        
        // Save all settings from the main settings modal
        // Deprecated - using auto-save now
        function saveAllSettings() {
            // For backward compatibility if called
            savePomodoroSettingsFromMain();
        }
        
        // Ad management
        function initAds() {
            const adContainer = document.getElementById('adContainer');
            
            // Always show ads
            adContainer.classList.remove('hidden');
            document.body.classList.add('ad-visible');
            
            // Clear any old preferences
            localStorage.removeItem('adsHidden');
            
            // Load responsive ad
            updateAdSize();
        }
        
        
        function updateAdSize() {
            const adUnit = document.querySelector('.adsbygoogle');
            if (!adUnit) return;
            
            const width = window.innerWidth;
            
            if (width < 768) {
                // Mobile banner (320x50) - standard mobile size
                adUnit.style.width = '320px';
                adUnit.style.height = '50px';
            } else {
                // Desktop leaderboard (728x90) - standard desktop size
                adUnit.style.width = '728px';
                adUnit.style.height = '90px';
            }
        }
        
        // Initialize ads on load
        window.addEventListener('load', initAds);
        window.addEventListener('resize', updateAdSize);
        
        // Main Settings Functions
        function toggleMainSettings() {
            const modal = document.getElementById('mainSettingsModal');
            modal.classList.toggle('active');
            
            if (modal.classList.contains('active')) {
                loadSoundSettings();
                loadPomodoroSettingsToMain();
            }
        }

        function loadSoundSettings() {
            // Load saved sound settings
            const savedSound = localStorage.getItem('selectedSound');
            const savedVolume = localStorage.getItem('soundVolume');
            
            if (savedSound) {
                selectedSound = savedSound;
                document.querySelector(`input[name="timerSound"][value="${savedSound}"]`).checked = true;
            }
            
            if (savedVolume) {
                soundVolume = parseFloat(savedVolume);
                document.getElementById('volumeSlider').value = soundVolume * 100;
                document.getElementById('volumeValue').textContent = Math.round(soundVolume * 100) + '%';
            }
            
            // Update selected styling
            updateSoundOptionStyling();
        }

        function updateSoundOptionStyling() {
            document.querySelectorAll('.sound-option').forEach(option => {
                const radio = option.querySelector('input[type="radio"]');
                if (radio.checked) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        // Save sound selection with auto-save
        function initializeSoundSelection() {
            document.addEventListener('change', function(e) {
                if (e.target.name === 'timerSound') {
                    selectedSound = e.target.value;
                    localStorage.setItem('selectedSound', selectedSound);
                    updateSoundOptionStyling();
                    
                    // Show save indicator for sound changes
                    showSaveIndicator();
                }
            });
        }

        // Volume control with auto-save
        function initializeVolumeControl() {
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeValue = document.getElementById('volumeValue');
            
            if (volumeSlider) {
                volumeSlider.addEventListener('input', function() {
                    soundVolume = this.value / 100;
                    volumeValue.textContent = this.value + '%';
                    localStorage.setItem('soundVolume', soundVolume);
                    
                    // Show save indicator for volume changes
                    showSaveIndicator();
                });
            }
        }
        
        // Custom modal functions
        function showModal(title, message, isConfirm = false) {
            return new Promise((resolve) => {
                const modal = document.getElementById('modalOverlay');
                const modalTitle = document.getElementById('modalTitle');
                const modalMessage = document.getElementById('modalMessage');
                const modalButtons = document.getElementById('modalButtons');
                
                modalTitle.textContent = title;
                modalMessage.textContent = message;
                
                if (isConfirm) {
                    modalButtons.innerHTML = `
                        <button class="modal-btn modal-btn-cancel" onclick="closeModal(false)">Cancel</button>
                        <button class="modal-btn modal-btn-confirm" onclick="closeModal(true)">Confirm</button>
                    `;
                } else {
                    modalButtons.innerHTML = `
                        <button class="modal-btn modal-btn-confirm" onclick="closeModal(true)">OK</button>
                    `;
                }
                
                modalCallback = resolve;
                modal.classList.add('active');
            });
        }
        
        function closeModal(result) {
            const modal = document.getElementById('modalOverlay');
            modal.classList.remove('active');
            
            if (modalCallback) {
                modalCallback(result);
                modalCallback = null;
            }
        }
        
        // Override alert and confirm
        window.customAlert = function(message) {
            return showModal('Notice', message, false);
        };
        
        window.customConfirm = function(message) {
            return showModal('Confirmation', message, true);
        };

        function switchMode(newMode) {
            mode = newMode;
            reset();
            
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            const timerInputs = document.getElementById('timerInputs');
            const lapBtn = document.getElementById('lapBtn');
            const lapsContainer = document.getElementById('laps');
            const pomodoroStatus = document.getElementById('pomodoroStatus');
            const skipBtn = document.getElementById('skipBtn');
            // Pomodoro settings now in main settings

            if (mode === 'timer') {
                timerInputs.classList.remove('hidden');
                lapBtn.classList.add('hidden');
                lapsContainer.classList.add('hidden');
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
                lapsContainer.classList.add('hidden');
                pomodoroStatus.classList.remove('hidden');
                skipBtn.classList.remove('hidden');
                initPomodoro();
            }
        }

        function formatTime(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function updateDisplay() {
            document.getElementById('display').textContent = formatTime(time);
        }

        async function start() {
            // Handle unsaved Pomodoro settings
            if (mode === 'pomodoro') {
                const shouldContinue = await checkAndHandleUnsavedSettings();
                if (!shouldContinue) return;
            }
            
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
                            customAlert('Time\'s up!');
                        }
                    }
                } else {
                    time++;
                }
                updateDisplay();
            }, 1000);
        }

        async function pause() {
            // Handle unsaved Pomodoro settings
            if (mode === 'pomodoro') {
                const shouldContinue = await checkAndHandleUnsavedSettings();
                if (!shouldContinue) return;
            }
            
            isRunning = false;
            clearInterval(interval);
            document.getElementById('startBtn').classList.remove('hidden');
            document.getElementById('pauseBtn').classList.add('hidden');
        }

        async function reset() {
            // Handle unsaved Pomodoro settings
            if (mode === 'pomodoro') {
                const shouldContinue = await checkAndHandleUnsavedSettings();
                if (!shouldContinue) return;
            }
            
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

        function initPomodoro() {
            pomodoroPhase = 'work';
            pomodoroCount = 1;
            completedPomodoros = 0;
            time = POMODORO_TIMES.work;
            updateDisplay();
            updatePomodoroStatus();
        }

        function updatePomodoroStatus() {
            const phaseText = pomodoroPhase === 'work' ? 'Work Session' : 
                             pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break';
            
            document.getElementById('pomodoroPhase').textContent = phaseText;
            document.getElementById('pomodoroCount').textContent = 
                pomodoroPhase === 'work' ? `${pomodoroCount} of ${sessionsUntilLongBreak}` : 'Break Time';
            
            // Update dots
            updatePomodoroDots();
            
            // Update phase color
            const phaseElement = document.getElementById('pomodoroPhase');
            if (pomodoroPhase === 'work') {
                phaseElement.style.color = '#fbbf24';
            } else if (pomodoroPhase === 'shortBreak') {
                phaseElement.style.color = '#4ade80';
            } else {
                phaseElement.style.color = '#8b5cf6';
            }
        }

        function handlePomodoroComplete() {
            if (pomodoroPhase === 'work') {
                completedPomodoros++;
                if (completedPomodoros >= sessionsUntilLongBreak) {
                    pomodoroPhase = 'longBreak';
                    customAlert('Great job! Time for a long break!');
                } else {
                    pomodoroPhase = 'shortBreak';
                    customAlert('Work session complete! Time for a short break.');
                }
                pomodoroCount = completedPomodoros + 1;
            } else if (pomodoroPhase === 'shortBreak') {
                pomodoroPhase = 'work';
                customAlert('Break over! Let\'s get back to work.');
            } else if (pomodoroPhase === 'longBreak') {
                completedPomodoros = 0;
                pomodoroCount = 1;
                pomodoroPhase = 'work';
                customAlert('Long break over! Starting a new cycle.');
            }
            
            time = POMODORO_TIMES[pomodoroPhase];
            updateDisplay();
            updatePomodoroStatus();
        }

        async function skipPomodoro() {
            // Handle unsaved settings first
            const shouldContinue = await checkAndHandleUnsavedSettings();
            if (!shouldContinue) return;
            
            if (await customConfirm('Are you sure you want to skip this session?')) {
                time = 0;
                pause();
                handlePomodoroComplete();
            }
        }

        function lap() {
            laps.push(time);
            const lapsContainer = document.getElementById('laps');
            lapsContainer.classList.remove('hidden');
            
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            lapItem.innerHTML = `
                <span>Lap ${laps.length}</span>
                <span>${formatTime(time)}</span>
            `;
            
            lapsContainer.insertBefore(lapItem, lapsContainer.firstChild);
        }

        // Sound System
        function createAudioContext() {
            return new (window.AudioContext || window.webkitAudioContext)();
        }

        function playBasicTone(frequency, duration, type = 'sine', volume = soundVolume) {
            const audioContext = createAudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }

        function playChimeSequence(volume = soundVolume) {
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    playBasicTone(freq, 0.8, 'sine', volume);
                }, index * 300);
            });
        }

        function playBellSound(volume = soundVolume) {
            const audioContext = createAudioContext();
            const fundamental = 200;
            const partials = [1, 2, 2.4, 3, 4.2]; // Bell harmonics
            
            partials.forEach((partial, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(fundamental * partial, audioContext.currentTime);
                oscillator.type = 'sine';
                
                const partialVolume = volume * (1 / (index + 1));
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(partialVolume, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 2);
            });
        }

        function playSound() {
            if (selectedSound === 'none') return;
            
            switch(selectedSound) {
                case 'sine':
                    playBasicTone(880, 1, 'sine');
                    break;
                case 'square':
                    playBasicTone(800, 0.2, 'square');
                    setTimeout(() => playBasicTone(800, 0.2, 'square'), 300);
                    break;
                case 'triangle':
                    playBasicTone(600, 0.8, 'triangle');
                    break;
                case 'chime':
                    playChimeSequence();
                    break;
                case 'bell':
                    playBellSound();
                    break;
            }
        }

        function previewSound(soundType) {
            event.preventDefault();
            event.stopPropagation();
            
            const originalSound = selectedSound;
            selectedSound = soundType;
            playSound();
            selectedSound = originalSound;
        }

        // Input validation
        document.getElementById('hoursInput').addEventListener('input', function(e) {
            if (e.target.value > 23) e.target.value = 23;
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
            // Block common developer tools shortcuts
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                customAlert('Developer tools are disabled for security reasons.');
                return false;
            }
            
            // Normal keyboard shortcuts
            if (e.code === 'Space') {
                e.preventDefault();
                if (isRunning) {
                    pause();
                } else {
                    start();
                }
            } else if (e.code === 'KeyR') {
                reset();
            } else if (e.code === 'KeyL' && mode === 'stopwatch' && isRunning) {
                lap();
            }
        });
        
        // Disable right-click context menu
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Disable text selection on timer display
        document.getElementById('display').style.userSelect = 'none';
        document.getElementById('display').style.webkitUserSelect = 'none';
        
        // Make functions globally accessible
        window.start = start;
        window.pause = pause;
        window.reset = reset;
        window.lap = lap;
        window.skipPomodoro = skipPomodoro;
        window.switchMode = switchMode;
        window.toggleMainSettings = toggleMainSettings;
        window.saveAllSettings = saveAllSettings;
        window.previewSound = previewSound;
        window.markMainSettingsChanged = markMainSettingsChanged;
        window.markPomodoroSettingsChanged = markPomodoroSettingsChanged;
        window.savePomodoroSettings = savePomodoroSettings;
        window.togglePomodoroSettings = togglePomodoroSettings;
        window.autoSaveSettings = autoSaveSettings;
        window.showSaveIndicator = showSaveIndicator;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

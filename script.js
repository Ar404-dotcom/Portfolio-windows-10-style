// Loading Screen
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const desktop = document.querySelector('.desktop');
    
    // Simulate loading time (3 seconds)
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        desktop.classList.add('show');
        
        // Remove loading screen after animation
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 3000);
});

// Update time and date in taskbar
function updateTime() {
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    
    timeElement.textContent = timeString;
    dateElement.textContent = dateString;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime();

// Window management
let activeWindows = new Set();

function openFolder(folderName) {
    const window = document.getElementById(`${folderName}-window`);
    
    // Close other windows if they're not in the same row
    const windowRect = window.getBoundingClientRect();
    activeWindows.forEach(activeWindow => {
        const activeRect = activeWindow.getBoundingClientRect();
        if (Math.abs(activeRect.top - windowRect.top) > 50) {
            closeFolder(activeWindow.id.replace('-window', ''));
        }
    });
    
    window.classList.add('active');
    activeWindows.add(window);
    
    // Make window draggable
    makeDraggable(window);
    
    // Add window to taskbar
    addToTaskbar(folderName);
}

function closeFolder(folderName) {
    const window = document.getElementById(`${folderName}-window`);
    window.classList.remove('active');
    activeWindows.delete(window);
    
    // Remove from taskbar
    removeFromTaskbar(folderName);
}

// Taskbar management
function addToTaskbar(folderName) {
    const taskbar = document.querySelector('.taskbar');
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.innerHTML = `
        <i class="fas ${getIconForFolder(folderName)}"></i>
        <span>${folderName.charAt(0).toUpperCase() + folderName.slice(1)}</span>
    `;
    taskbarItem.onclick = () => toggleWindow(folderName);
    taskbar.insertBefore(taskbarItem, document.querySelector('.time'));
}

function removeFromTaskbar(folderName) {
    const taskbarItems = document.querySelectorAll('.taskbar-item');
    taskbarItems.forEach(item => {
        if (item.textContent.trim().toLowerCase() === folderName) {
            item.remove();
        }
    });
}

function getIconForFolder(folderName) {
    const icons = {
        academics: 'fa-graduation-cap',
        projects: 'fa-project-diagram',
        skills: 'fa-tools',
        links: 'fa-link',
        contact: 'fa-address-card',
        introduction: 'fa-user'
    };
    return icons[folderName] || 'fa-folder';
}

function toggleWindow(folderName) {
    const window = document.getElementById(`${folderName}-window`);
    if (window.classList.contains('active')) {
        closeFolder(folderName);
    } else {
        openFolder(folderName);
    }
}

// Make windows draggable
function makeDraggable(element) {
    const header = element.querySelector('.window-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target === header || e.target.parentElement === header) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
            
            // Bring window to front
            element.style.zIndex = getHighestZIndex() + 1;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, element);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
}

function getHighestZIndex() {
    return Math.max(
        ...Array.from(document.querySelectorAll('.window'))
            .map(el => parseFloat(window.getComputedStyle(el).zIndex) || 0)
    );
}

// Close window when clicking outside
document.addEventListener('click', (e) => {
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        if (!window.contains(e.target) && !e.target.closest('.icon') && !e.target.closest('.taskbar-item')) {
            closeFolder(window.id.replace('-window', ''));
        }
    });
});

// Add styles for taskbar items
const style = document.createElement('style');
style.textContent = `
    .taskbar-item {
        display: flex;
        align-items: center;
        padding: 0 10px;
        height: 100%;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .taskbar-item:hover {
        background-color: rgba(0, 120, 212, 0.1);
    }
    
    .taskbar-item i {
        margin-right: 5px;
        color: #0078d4;
    }
    
    .taskbar-item span {
        color: #333;
        font-size: 12px;
    }
`;
document.head.appendChild(style);

// Start Menu functionality
const startButton = document.querySelector('.start-button');
const startMenu = document.querySelector('.start-menu');

startButton.addEventListener('click', () => {
    startMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
        startMenu.classList.remove('active');
    }
});

// Terminal functionality
const terminalBtn = document.querySelector('.terminal-btn');
const terminal = document.querySelector('.terminal');
const terminalInput = document.querySelector('.terminal-input');
let currentDirectory = 'C:\\Users\\Ariyan';

terminalBtn.addEventListener('click', () => {
    if (terminal.style.display === 'none' || !terminal.style.display) {
        terminal.style.display = 'block';
        terminalInput.focus();
    } else {
        terminal.style.display = 'none';
    }
});

function updatePrompt() {
    document.querySelector('.prompt').textContent = `${currentDirectory}>`;
}

function addTerminalOutput(text) {
    const output = document.createElement('div');
    output.textContent = text;
    output.style.color = '#ffffff';
    document.querySelector('.terminal-content').insertBefore(output, document.querySelector('.terminal-input-line'));
}

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = terminalInput.value.trim().toLowerCase();
        const output = executeCommand(command);
        addTerminalOutput(`${currentDirectory}> ${command}`);
        if (output) addTerminalOutput(output);
        terminalInput.value = '';
        updatePrompt();
    }
});

function executeCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
        case 'cd':
            if (args.length === 0) {
                return currentDirectory;
            }
            if (args[0] === '..') {
                const dirs = currentDirectory.split('\\');
                if (dirs.length > 1) {
                    dirs.pop();
                    currentDirectory = dirs.join('\\');
                }
                return '';
            }
            currentDirectory = `${currentDirectory}\\${args[0]}`;
            return '';
        case 'dir':
        case 'ls':
            return `
Directory of ${currentDirectory}
[DIR]  Desktop
[DIR]  Documents
[DIR]  Projects
[FILE] resume.html
[FILE] styles.css
[FILE] script.js`;
        case 'clear':
        case 'cls':
            document.querySelector('.terminal-content').innerHTML = '';
            document.querySelector('.terminal-content').appendChild(document.querySelector('.terminal-input-line'));
            return '';
        case 'help':
            return `
Available commands:
cd [directory] - Change directory
dir/ls - List directory contents
clear/cls - Clear screen
help - Show this help message`;
        default:
            return `'${command}' is not recognized as an internal or external command.`;
    }
}

// Search functionality
const searchBox = document.querySelector('.search-box input');
const searchResults = document.createElement('div');
searchResults.className = 'search-results';
document.querySelector('.search-box').appendChild(searchResults);

searchBox.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    searchResults.innerHTML = '';
    
    if (searchTerm.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    let results = [];
    
    // Search windows
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        const title = window.querySelector('.window-header').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            results.push({
                name: title,
                icon: window.querySelector('.window-header i')?.className || 'fas fa-window-maximize',
                type: 'window',
                action: () => {
                    window.style.display = 'block';
                    window.style.zIndex = getTopZIndex() + 1;
                }
            });
        }
    });

    // Search social apps
    const socialApps = [
        { name: 'Gmail', icon: 'fa-envelope', url: 'https://gmail.com' },
        { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com' },
        { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com' },
        { name: 'Chess.com', icon: 'fas fa-chess', url: 'https://chess.com' },
        { name: 'YouTube', icon: 'fab fa-youtube', url: 'https://youtube.com' },
        { name: 'Spotify', icon: 'fab fa-spotify', url: 'https://spotify.com' },
        { name: 'Google', icon: 'fab fa-google', url: 'https://google.com' },
        { name: 'Amazon', icon: 'fab fa-amazon', url: 'https://amazon.com' }
    ];

    socialApps.forEach(app => {
        if (app.name.toLowerCase().includes(searchTerm)) {
            results.push({
                name: app.name,
                icon: app.icon,
                type: 'app',
                action: () => window.open(app.url, '_blank')
            });
        }
    });

    if (results.length > 0) {
        searchResults.style.display = 'block';
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <i class="${result.type === 'app' ? result.icon : result.icon}"></i>
                <span>${result.name}</span>
            `;
            resultItem.addEventListener('click', () => {
                result.action();
                searchBox.value = '';
                searchResults.style.display = 'none';
            });
            searchResults.appendChild(resultItem);
        });
    } else {
        searchResults.style.display = 'none';
    }
});

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        searchResults.style.display = 'none';
    }
});

// Terminal window controls functionality
const terminalWindow = document.querySelector('.terminal');
const minimizeBtn = terminalWindow.querySelector('.minimize-btn');
const maximizeBtn = terminalWindow.querySelector('.maximize-btn');
const terminalCloseBtn = terminalWindow.querySelector('.close-btn');

minimizeBtn.addEventListener('click', () => {
    terminalWindow.style.display = 'none';
});

maximizeBtn.addEventListener('click', () => {
    if (terminalWindow.style.width === '100%') {
        terminalWindow.style.width = '600px';
        terminalWindow.style.height = '400px';
        terminalWindow.style.top = '50%';
        terminalWindow.style.left = '50%';
        terminalWindow.style.transform = 'translate(-50%, -50%)';
    } else {
        terminalWindow.style.width = '100%';
        terminalWindow.style.height = 'calc(100vh - 40px)';
        terminalWindow.style.top = '0';
        terminalWindow.style.left = '0';
        terminalWindow.style.transform = 'none';
    }
});

terminalCloseBtn.addEventListener('click', () => {
    terminalWindow.style.display = 'none';
});

// Add social media apps to taskbar
const socialApps = [
    { name: 'Gmail', icon: 'fa-envelope', url: 'https://gmail.com' },
    { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com' },
    { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com' },
    { name: 'Chess.com', icon: 'fas fa-chess', url: 'https://chess.com' },
    { name: 'YouTube', icon: 'fab fa-youtube', url: 'https://youtube.com' },
    { name: 'Spotify', icon: 'fab fa-spotify', url: 'https://spotify.com' },
    { name: 'Google', icon: 'fab fa-google', url: 'https://google.com' },
    { name: 'Amazon', icon: 'fab fa-amazon', url: 'https://amazon.com' }
];

function addSocialAppsToTaskbar() {
    const taskbarLeft = document.querySelector('.taskbar-left');
    
    socialApps.forEach(app => {
        const appButton = document.createElement('div');
        appButton.className = 'taskbar-item social-app';
        appButton.innerHTML = `<i class="${app.icon}"></i>`;
        appButton.title = app.name;
        
        appButton.addEventListener('click', () => {
            window.open(app.url, '_blank');
        });
        
        taskbarLeft.appendChild(appButton);
    });
}

// Call the function to add social apps
addSocialAppsToTaskbar();

// Weather functionality
async function getWeather() {
    try {
        // Using Open-Meteo API with fixed coordinates for Vijayawada
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=16.5074&longitude=80.6466&hourly=temperature_2m,relative_humidity_2m,rain,cloud_cover&current_weather=true`);
        const data = await response.json();

        // Update weather widget
        const weatherWidget = document.createElement('div');
        weatherWidget.className = 'weather-widget';
        
        const weatherIcon = getWeatherIcon(data.current_weather.weathercode);
        const temperature = Math.round(data.current_weather.temperature);
        
        weatherWidget.innerHTML = `
            <i class="${weatherIcon}"></i>
            <div class="weather-info">
                <div class="weather-temp">${temperature}°C</div>
                <div class="weather-location">Vijayawada</div>
            </div>
        `;

        // Remove existing weather widget if it exists
        const existingWidget = document.querySelector('.weather-widget');
        if (existingWidget) {
            existingWidget.remove();
        }

        // Insert weather widget before the time-date div
        const timeDate = document.querySelector('.time-date');
        timeDate.parentNode.insertBefore(weatherWidget, timeDate);

    } catch (error) {
        console.error('Error fetching weather:', error);
        // Show default weather widget if there's an error
        const weatherWidget = document.createElement('div');
        weatherWidget.className = 'weather-widget';
        weatherWidget.innerHTML = `
            <i class="fas fa-cloud"></i>
            <div class="weather-info">
                <div class="weather-temp">--°C</div>
                <div class="weather-location">Vijayawada</div>
            </div>
        `;
        const existingWidget = document.querySelector('.weather-widget');
        if (existingWidget) {
            existingWidget.remove();
        }
        const timeDate = document.querySelector('.time-date');
        timeDate.parentNode.insertBefore(weatherWidget, timeDate);
    }
}

function getWeatherIcon(weatherCode) {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    const icons = {
        0: 'fas fa-sun', // Clear sky
        1: 'fas fa-sun', // Mainly clear
        2: 'fas fa-cloud-sun', // Partly cloudy
        3: 'fas fa-cloud', // Overcast
        45: 'fas fa-smog', // Foggy
        48: 'fas fa-smog', // Depositing rime fog
        51: 'fas fa-cloud-rain', // Light drizzle
        53: 'fas fa-cloud-rain', // Moderate drizzle
        55: 'fas fa-cloud-rain', // Dense drizzle
        61: 'fas fa-cloud-rain', // Slight rain
        63: 'fas fa-cloud-rain', // Moderate rain
        65: 'fas fa-cloud-showers-heavy', // Heavy rain
        71: 'fas fa-snowflake', // Slight snow fall
        73: 'fas fa-snowflake', // Moderate snow fall
        75: 'fas fa-snowflake', // Heavy snow fall
        77: 'fas fa-snowflake', // Snow grains
        80: 'fas fa-cloud-rain', // Slight rain showers
        81: 'fas fa-cloud-rain', // Moderate rain showers
        82: 'fas fa-cloud-showers-heavy', // Violent rain showers
        85: 'fas fa-snowflake', // Slight snow showers
        86: 'fas fa-snowflake', // Heavy snow showers
        95: 'fas fa-bolt', // Thunderstorm
        96: 'fas fa-bolt', // Thunderstorm with slight hail
        99: 'fas fa-bolt', // Thunderstorm with heavy hail
    };
    return icons[weatherCode] || 'fas fa-cloud';
}

// Call getWeather on page load and every 5 minutes
getWeather();
setInterval(getWeather, 5 * 60 * 1000);

// Mobile touch handling
let touchStartX = 0;
let touchStartY = 0;
let initialWindowX = 0;
let initialWindowY = 0;
let isDragging = false;

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    const window = e.target.closest('.window');
    if (window && e.target.closest('.window-header')) {
        isDragging = true;
        const rect = window.getBoundingClientRect();
        initialWindowX = rect.left;
        initialWindowY = rect.top;
    }
}

function handleTouchMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    const window = e.target.closest('.window');
    if (window) {
        window.style.left = `${initialWindowX + deltaX}px`;
        window.style.top = `${initialWindowY + deltaY}px`;
        window.style.transform = 'none';
    }
}

function handleTouchEnd() {
    isDragging = false;
}

// Add touch event listeners
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd);

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Adjust behavior for mobile
if (isMobile) {
    // Double tap to close windows
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        const window = e.target.closest('.window');
        
        if (tapLength < 500 && tapLength > 0 && window) {
            window.style.display = 'none';
        }
        lastTap = currentTime;
    });

    // Prevent zoom on double tap
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            e.preventDefault();
        }
        lastTap = now;
    }, { passive: false });

    // Adjust window positioning for mobile
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        window.style.transform = 'none';
        window.style.left = '5%';
        window.style.top = '10%';
        window.style.width = '90%';
    });
}

// Handle orientation change
window.addEventListener('orientationchange', () => {
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        if (window.style.display === 'block') {
            window.style.left = '5%';
            window.style.top = '10%';
        }
    });
});

// Improve mobile scrolling
document.querySelectorAll('.window-content, .terminal-content, .start-menu-items').forEach(element => {
    element.addEventListener('touchstart', () => {
        element.style.overflow = 'auto';
    });
}); 
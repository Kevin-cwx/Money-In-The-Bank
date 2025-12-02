// Configuration
const CONFIG = {
    // Image dimensions (will be detected from loaded image)
    imageWidth: 0,
    imageHeight: 0,

    // Dashboard Mode Configuration (Template_3)
    dashboard: {
        money: {
            x: 0, // Will be calculated
            y: 0, // Will be calculated
            fontSize: 74,
            color: '#FFFFFF',
            fontWeight: '300',
            fontFamily: '"Inter", sans-serif'
        },
        balance: {
            x: 0, // Will be calculated
            y: 0, // Will be calculated
            fontSize: 32,
            color: '#FFFFFF',
            fontWeight: '300',
            fontFamily: '"Inter", sans-serif'
        }
    },

    // Login Page Configuration (Login_Template)
    login: {
        text: {
            x: 0, // Will be calculated (center)
            y: 0, // Will be calculated (center/adjusted)
            fontSize: 28, // Smaller font size
            color: '#004080', // Darker blue
            fontWeight: '200', // Thinner weight
            fontFamily: '"Inter", sans-serif'
        }
    }
};

// State
let currentMode = 'dashboard'; // 'dashboard' or 'login'
let baseImage = null;
let currentImageData = null;

// DOM Elements
const moneyInput = document.getElementById('moneyInput');
const genderSelect = document.getElementById('genderSelect');
const nameInput = document.getElementById('nameInput');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

const tabDashboard = document.getElementById('tabDashboard');
const tabLogin = document.getElementById('tabLogin');
const dashboardControls = document.getElementById('dashboardControls');
const loginControls = document.getElementById('loginControls');

// Load the base image based on current mode
function loadBaseImage() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            baseImage = img;
            CONFIG.imageWidth = img.width;
            CONFIG.imageHeight = img.height;

            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Calculate positions based on mode
            if (currentMode === 'dashboard') {
                // Position to align with "XCG" text on the same line
                CONFIG.dashboard.money.x = img.width / 2;
                CONFIG.dashboard.money.y = (img.height / 2) - 5;

                // Position for "Current Balance" duplicate
                CONFIG.dashboard.balance.x = img.width * 0.5;
                CONFIG.dashboard.balance.y = img.height * 0.687;
            } else {
                // Login Page Positions
                CONFIG.login.text.x = img.width / 2;
                // Positioned lower, above "Login with another user" (estimated)
                CONFIG.login.text.y = img.height * 0.55;
            }

            // Generate initial image
            generateScreenshot();

            resolve(img);
        };
        img.onerror = reject;

        // Select template based on mode
        img.src = currentMode === 'dashboard' ? 'Media/Template_3.jpg' : 'Media/Login_Template.jpg';
    });
}

// Format number with commas (no $ sign)
function formatNumber(value) {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

// Generate the screenshot
async function generateScreenshot() {
    if (!baseImage) {
        await loadBaseImage();
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base image
    ctx.drawImage(baseImage, 0, 0);

    if (currentMode === 'dashboard') {
        renderDashboard();
    } else {
        renderLogin();
    }

    // Enable download button
    downloadBtn.disabled = false;

    // Store current canvas data
    currentImageData = canvas.toDataURL('image/png');
}

function renderDashboard() {
    const moneyAmount = moneyInput.value || '0';
    const config = CONFIG.dashboard;

    // --- Draw Main Money Amount ---
    ctx.font = `${config.money.fontWeight} ${config.money.fontSize}px ${config.money.fontFamily}`;
    ctx.fillStyle = config.money.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate text width and adjust position to prevent overlap with "XCG"
    const textMetrics = ctx.measureText(moneyAmount);
    const textWidth = textMetrics.width;

    // Define safe left boundary (42% of image width)
    const safeLeftBoundary = canvas.width * 0.42;

    let drawX = config.money.x;
    const currentLeftEdge = drawX - (textWidth / 2);

    // If text extends too far left (overlapping XCG), shift center right
    if (currentLeftEdge < safeLeftBoundary) {
        drawX = safeLeftBoundary + (textWidth / 2);
    }

    ctx.fillText(moneyAmount, drawX, config.money.y);

    // --- Draw Duplicate Balance Amount ---
    ctx.font = `${config.balance.fontWeight} ${config.balance.fontSize}px ${config.balance.fontFamily}`;
    ctx.fillStyle = config.balance.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const balanceText = "XCG " + moneyAmount;
    ctx.fillText(balanceText, config.balance.x, config.balance.y);
}

function renderLogin() {
    const gender = genderSelect.value;
    const name = nameInput.value || '';
    const fullName = `${gender} ${name}`.toUpperCase(); // Ensure uppercase
    const config = CONFIG.login.text;

    ctx.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;
    ctx.fillStyle = config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(fullName, config.x, config.y);
}

// Download the generated image
function downloadImage() {
    if (!currentImageData) return;

    const link = document.createElement('a');
    const filename = currentMode === 'dashboard' ? 'money_in_the_bank.png' : 'login_welcome.png';
    link.download = filename;
    link.href = currentImageData;
    link.click();
}

// Switch Tabs
function switchTab(mode) {
    if (currentMode === mode) return;

    currentMode = mode;

    // Update Tab UI
    if (mode === 'dashboard') {
        tabDashboard.classList.add('active');
        tabLogin.classList.remove('active');
        dashboardControls.classList.remove('hidden');
        loginControls.classList.add('hidden');
    } else {
        tabDashboard.classList.remove('active');
        tabLogin.classList.add('active');
        dashboardControls.classList.add('hidden');
        loginControls.classList.remove('hidden');
    }

    // Reload image and regenerate
    loadBaseImage().catch(err => {
        console.error('Failed to load base image:', err);
        alert(`Failed to load template for ${mode} mode.`);
    });
}

// Event listeners
downloadBtn.addEventListener('click', downloadImage);

tabDashboard.addEventListener('click', () => switchTab('dashboard'));
tabLogin.addEventListener('click', () => switchTab('login'));

// Dashboard Inputs
moneyInput.addEventListener('input', (e) => {
    let rawValue = e.target.value.replace(/,/g, '');
    rawValue = rawValue.replace(/[^\d.]/g, '');

    const dotIndex = rawValue.indexOf('.');
    if (dotIndex !== -1) {
        rawValue = rawValue.substring(0, dotIndex + 1) + rawValue.substring(dotIndex + 1).replace(/\./g, '');
    }

    if (rawValue.length > 11) {
        rawValue = rawValue.substring(0, 11);
    }

    const formatted = formatNumber(rawValue);
    if (e.target.value !== formatted) {
        e.target.value = formatted;
    }

    if (currentMode === 'dashboard') generateScreenshot();
});

// Login Inputs
genderSelect.addEventListener('change', () => {
    if (currentMode === 'login') generateScreenshot();
});

nameInput.addEventListener('input', (e) => {
    // Restrict to alphabets and spaces only
    let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');

    // Force uppercase
    value = value.toUpperCase();

    // Update input value if changed
    if (e.target.value !== value) {
        e.target.value = value;
    }

    if (currentMode === 'login') generateScreenshot();
});

// Clear button functionality
document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');
        const targetInput = document.getElementById(targetId);

        if (targetInput) {
            targetInput.value = '';
            targetInput.focus();

            // Regenerate screenshot after clearing
            if (currentMode === 'dashboard' && targetId === 'moneyInput') {
                generateScreenshot();
            } else if (currentMode === 'login' && targetId === 'nameInput') {
                generateScreenshot();
            }
        }
    });
});

// Initial Load
loadBaseImage().catch(err => {
    console.error('Failed to load base image:', err);
    alert('Failed to load base image. Please check that Template_3.jpg exists in the Media folder.');
});

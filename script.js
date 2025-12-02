// Configuration - positions matched to Template_3
const CONFIG = {
    // Image dimensions (will be detected from loaded image)
    imageWidth: 0,
    imageHeight: 0,

    // Money amount position - positioned on same line as "XCG"
    money: {
        x: 0, // Will be calculated
        y: 0, // Will be calculated to match "XCG" baseline
        fontSize: 74,
        color: '#FFFFFF',
        fontWeight: '300',
        fontFamily: '"Inter", sans-serif'
    },

    // Duplicate money position - next to "Current Balance"
    balance: {
        x: 0, // Will be calculated
        y: 0, // Will be calculated
        fontSize: 32, // Smaller font size
        color: '#FFFFFF',
        fontWeight: '300',
        fontFamily: '"Inter", sans-serif'
    }
};

const moneyInput = document.getElementById('moneyInput');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

let baseImage = null;
let currentImageData = null;

// Load the base image
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

            // Position to align with "XCG" text on the same line
            CONFIG.money.x = img.width / 2; // Center horizontally
            CONFIG.money.y = (img.height / 2) - 5; // Center vertically (adjusted up for visual alignment)

            // Position for "Current Balance" duplicate
            // Moved up slightly from 0.75, but lower than original 0.65
            CONFIG.balance.x = img.width * 0.5;
            CONFIG.balance.y = img.height * 0.687; // Adjusted to 0.70

            // Generate initial image
            generateScreenshot();

            resolve(img);
        };
        img.onerror = reject;
        img.src = 'Media/Template_3.jpg';
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

    const moneyAmount = moneyInput.value || '0';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base image (no masking needed - template already has text removed)
    ctx.drawImage(baseImage, 0, 0);

    // --- Draw Main Money Amount ---
    ctx.font = `${CONFIG.money.fontWeight} ${CONFIG.money.fontSize}px ${CONFIG.money.fontFamily}`;
    ctx.fillStyle = CONFIG.money.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate text width and adjust position to prevent overlap with "XCG"
    const textMetrics = ctx.measureText(moneyAmount);
    const textWidth = textMetrics.width;

    // Define safe left boundary (increased to 42% of image width to safely clear "XCG")
    const safeLeftBoundary = canvas.width * 0.42;

    let drawX = CONFIG.money.x;
    const currentLeftEdge = drawX - (textWidth / 2);

    // If text extends too far left (overlapping XCG), shift center right
    if (currentLeftEdge < safeLeftBoundary) {
        drawX = safeLeftBoundary + (textWidth / 2);
    }

    ctx.fillText(moneyAmount, drawX, CONFIG.money.y);

    // --- Draw Duplicate Balance Amount ---
    // Using smaller font, positioned next to "Current Balance"
    ctx.font = `${CONFIG.balance.fontWeight} ${CONFIG.balance.fontSize}px ${CONFIG.balance.fontFamily}`;
    ctx.fillStyle = CONFIG.balance.color;
    ctx.textAlign = 'left'; // Left aligned
    ctx.textBaseline = 'middle';

    // Add "XCG" prefix
    const balanceText = "XCG " + moneyAmount;

    ctx.fillText(balanceText, CONFIG.balance.x, CONFIG.balance.y);

    // Enable download button
    downloadBtn.disabled = false;

    // Store current canvas data
    currentImageData = canvas.toDataURL('image/png');
}

// Download the generated image
function downloadImage() {
    if (!currentImageData) return;

    const link = document.createElement('a');
    link.download = `money_in_the_bank.png`;
    link.href = currentImageData;
    link.click();
}

// Event listeners
downloadBtn.addEventListener('click', downloadImage);

// Auto-update on input change (digits and dot only, max 11 chars)
moneyInput.addEventListener('input', (e) => {
    // Get raw value (strip commas first to handle clean processing)
    let rawValue = e.target.value.replace(/,/g, '');

    // Remove invalid chars (keep digits and dots)
    rawValue = rawValue.replace(/[^\d.]/g, '');

    // Handle multiple dots (keep only the first one)
    const dotIndex = rawValue.indexOf('.');
    if (dotIndex !== -1) {
        rawValue = rawValue.substring(0, dotIndex + 1) + rawValue.substring(dotIndex + 1).replace(/\./g, '');
    }

    // Limit length to 11 characters (matches 12,345,674.99 format)
    if (rawValue.length > 11) {
        rawValue = rawValue.substring(0, 11);
    }

    // Format with commas
    const formatted = formatNumber(rawValue);

    // Update input value if it changed (to show formatting)
    if (e.target.value !== formatted) {
        e.target.value = formatted;
    }

    // Regenerate the screenshot
    generateScreenshot();
});

// Load image on page load
loadBaseImage().catch(err => {
    console.error('Failed to load base image:', err);
    alert('Failed to load base image. Please check that Template_3.jpg exists in the Media folder.');
});

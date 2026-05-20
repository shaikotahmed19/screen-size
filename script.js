// Math helper to find greatest common divisor
function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

// Function to find common aspect ratios or return custom simplified ones
function getAspectRatioLabel(width, height) {
    if (!width || !height) return "N/A";
    
    const ratioVal = width / height;
    const tolerance = 0.015; // Tolerance for close matches (e.g. standard scales)
    
    const commonRatios = [
        { name: "16:9", val: 16 / 9 },
        { name: "16:10", val: 16 / 10 },
        { name: "4:3", val: 4 / 3 },
        { name: "21:9", val: 21 / 9 },
        { name: "32:9", val: 32 / 9 },
        { name: "3:2", val: 3 / 2 },
        { name: "1:1", val: 1 },
        { name: "9:16", val: 9 / 16 },
        { name: "10:16", val: 10 / 16 },
        { name: "3:4", val: 3 / 4 }
    ];
    
    for (const ratio of commonRatios) {
        if (Math.abs(ratioVal - ratio.val) < tolerance) {
            return ratio.name;
        }
    }
    
    // Fallback to strict mathematical ratio simplification
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
}

// Update the dimensions of the preview box proportionally
function updateVisualRatio(elementId, width, height) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Box outer boundaries
    const maxW = 160;
    const maxH = 90;
    
    const ratio = width / height;
    let targetW = maxW;
    let targetH = maxW / ratio;
    
    if (targetH > maxH) {
        targetH = maxH;
        targetW = maxH * ratio;
    }
    
    element.style.width = `${Math.round(targetW)}px`;
    element.style.height = `${Math.round(targetH)}px`;
}

// Elements reference
const screenWidthEl = document.getElementById('screen-width');
const screenHeightEl = document.getElementById('screen-height');
const screenRatioVal = document.getElementById('screen-ratio-val');
const metaScreenDpr = document.getElementById('meta-screen-dpr');
const metaScreenDepth = document.getElementById('meta-screen-depth');
const metaScreenOrientation = document.getElementById('meta-screen-orientation');

const browserWidthEl = document.getElementById('browser-width');
const browserHeightEl = document.getElementById('browser-height');
const browserRatioVal = document.getElementById('browser-ratio-val');
const metaOuterWidth = document.getElementById('meta-outer-width');
const metaOuterHeight = document.getElementById('meta-outer-height');
const metaTouchSupported = document.getElementById('meta-touch-supported');

const browserCard = document.getElementById('card-browser');
const toast = document.getElementById('toast');

// Update total screen size metrics
function updateScreenSize() {
    const width = window.screen.width || 0;
    const height = window.screen.height || 0;
    
    screenWidthEl.textContent = width;
    screenHeightEl.textContent = height;
    
    // Set ratio display and box visual size
    screenRatioVal.textContent = getAspectRatioLabel(width, height);
    updateVisualRatio('screen-ratio-preview', width, height);
    
    // Additional metrics
    metaScreenDpr.textContent = `${window.devicePixelRatio.toFixed(1)}x`;
    metaScreenDepth.textContent = `${window.screen.colorDepth}-bit`;
    
    // Screen orientation detect
    let orientation = "Landscape";
    if (window.screen.orientation && window.screen.orientation.type) {
        const type = window.screen.orientation.type;
        if (type.includes("portrait")) orientation = "Portrait";
    } else if (height > width) {
        orientation = "Portrait";
    }
    metaScreenOrientation.textContent = orientation;
}

let resizeTimeout;

// Update active browser viewport metrics
function updateBrowserSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    browserWidthEl.textContent = width;
    browserHeightEl.textContent = height;
    
    // Set ratio display and box visual size
    browserRatioVal.textContent = getAspectRatioLabel(width, height);
    updateVisualRatio('browser-ratio-preview', width, height);
    
    // Additional metrics
    metaOuterWidth.textContent = `${window.outerWidth}px`;
    metaOuterHeight.textContent = `${window.outerHeight}px`;
    
    // Touch interface check
    const touchSupported = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    metaTouchSupported.textContent = touchSupported ? "Yes" : "No";
    
    // Active resizing visual feedback
    browserCard.classList.add('active-card');
    browserCard.classList.add('resize-flash');
    
    // Clear and reset highlight transition when resizing pauses
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        browserCard.classList.remove('resize-flash');
    }, 400);
}

// Copy metrics to clipboard and show success toast
function copyToClipboard(text, buttonEl) {
    navigator.clipboard.writeText(text).then(() => {
        // Change button state
        const originalText = buttonEl.querySelector('span').textContent;
        const originalIcon = buttonEl.querySelector('.copy-icon').outerHTML;
        
        buttonEl.classList.add('copied');
        buttonEl.querySelector('span').textContent = 'Copied!';
        buttonEl.querySelector('.copy-icon').innerHTML = '<path d="M20 6L9 17l-5-5"></path>'; // checkmark path in SVG
        
        // Show Toast notification
        toast.textContent = `Dimensions copied: ${text}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            buttonEl.classList.remove('copied');
            buttonEl.querySelector('span').textContent = originalText;
            buttonEl.querySelector('.copy-icon').outerHTML = originalIcon;
        }, 1500);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Setup Event Listeners
window.addEventListener('resize', updateBrowserSize);

// Handle screen geometry updates on screen orientation change
if (window.screen.orientation) {
    window.screen.orientation.addEventListener('change', updateScreenSize);
}

document.getElementById('btn-copy-screen').addEventListener('click', function() {
    const text = `${screenWidthEl.textContent} x ${screenHeightEl.textContent} px`;
    copyToClipboard(text, this);
});

document.getElementById('btn-copy-browser').addEventListener('click', function() {
    const text = `${browserWidthEl.textContent} x ${browserHeightEl.textContent} px`;
    copyToClipboard(text, this);
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    updateScreenSize();
    updateBrowserSize();
    // Remove the initial resize flash immediately on load so it only flashes when dragged/resized
    setTimeout(() => {
        browserCard.classList.remove('resize-flash');
    }, 400);
});

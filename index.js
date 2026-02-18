const fs = require('fs');
const path = require('path');

// CONFIGURATION


const TARGET_FOLDER = '/Users/richardshajimekkaden/Downloads';

const CATEGORIES = {
    Images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    Documents: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.ppt', '.pptx'],
    Videos: ['.mp4', '.mkv', '.avi', '.mov'],
    Audio: ['.mp3', '.wav'],
    Installers: ['.exe', '.dmg', '.pkg', '.deb', '.msi'],
    Archives: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    Code: ['.js', '.py', '.html', '.css', '.java', '.cpp']
};

// State to prevent duplicate processing (Debounce)
let processingFile = null;

/**
 * Main execution function - Now strictly sets up the watcher
 */
function main() {
    console.log(`---------------------------------`);
    console.log(`STARTED WATCHING: ${TARGET_FOLDER}`);
    console.log(`Waiting for new files... (Press Ctrl+C to stop)`);

    if (fs.existsSync(TARGET_FOLDER) === false) {
        console.error('Error: Target folder does not exist.');
        return;
    }

    // Run once immediately to clean up existing mess
    organizeExistingFiles();

    // Start the Watcher
    fs.watch(TARGET_FOLDER, function(eventType, filename) {
        handleFileEvent(eventType, filename);
    });
}

/**
 * Handles file system events
 * @param {string} eventType 
 * @param {string} filename 
 */
function handleFileEvent(eventType, filename) {
    // "rename" event occurs when a file appears or disappears
    if (eventType === 'rename' && filename) {
        
        // Simple Debounce: If we just processed this file, ignore it
        if (processingFile === filename) {
            return;
        }

        console.log(`Detected change: ${filename}`);
        
        // Wait 1 second to ensure download/copy is finished (Safety buffer)
        setTimeout(function() {
            processFile(filename);
            processingFile = null; // Reset lock
        }, 1000); 
        
        processingFile = filename; // Set lock
    }
}

/**
 * Scans and organizes everything currently in the folder
 */
function organizeExistingFiles() {
    const files = fs.readdirSync(TARGET_FOLDER);
    console.log(`Scanning existing files...`);
    
    for (let i = 0; i < files.length; i++) {
        processFile(files[i]);
    }
}

/**
 * Determines the category and moves the file
 * @param {string} fileName 
 * @returns {boolean} true if moved, false otherwise
 */
function processFile(fileName) {
    // Skip system files or hidden files
    if (!fileName || fileName.startsWith('.')) {
        return false;
    }

    const sourcePath = path.join(TARGET_FOLDER, fileName);
    
    // Check if file still exists (it might have been moved already or deleted)
    if (fs.existsSync(sourcePath) === false) {
        return false;
    }

    // Ensure we are processing a file, not a directory
    try {
        if (fs.lstatSync(sourcePath).isDirectory()) {
            return false;
        }
    } catch (err) {
        // File might be busy or locked
        return false;
    }

    const extension = path.extname(fileName).toLowerCase();
    const category = getCategory(extension);

    if (category !== null) {
        return moveFileToCategory(fileName, category);
    }

    return false;
}

/**
 * Helper to find category based on extension
 * @param {string} extension 
 * @returns {string|null} category name or null
 */
function getCategory(extension) {
    const categoryNames = Object.keys(CATEGORIES);

    for (let i = 0; i < categoryNames.length; i++) {
        const category = categoryNames[i];
        const extensions = CATEGORIES[category];

        if (extensions.includes(extension)) {
            return category;
        }
    }
    
    return null;
}

/**
 * Moves file to the specific category folder
 * @param {string} fileName 
 * @param {string} category 
 * @returns {boolean} success status
 */
function moveFileToCategory(fileName, category) {
    const destinationFolder = path.join(TARGET_FOLDER, category);
    const sourcePath = path.join(TARGET_FOLDER, fileName);
    const destPath = path.join(destinationFolder, fileName);

    // Create category folder if it doesn't exist
    if (fs.existsSync(destinationFolder) === false) {
        fs.mkdirSync(destinationFolder);
        console.log(`Created folder: ${category}`);
    }

    try {
        // Retry logic often needed for downloads that are "finishing up"
        fs.renameSync(sourcePath, destPath);
        console.log(`[MOVED] ${fileName} -> ${category}`);
        return true;
    } catch (error) {
        // Common error: EPERM (File is locked by browser because it's still downloading)
        console.log(`[BUSY] File is locked, will try again next cycle: ${fileName}`);
        return false;
    }
}

// Run the script
main();

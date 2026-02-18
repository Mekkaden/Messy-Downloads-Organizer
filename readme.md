# Automated Downloads Organizer

A background service built with Node.js that automatically organizes files in the Downloads directory based on file extensions. This tool uses filesystem watchers to detect new files in real-time and sorts them into categorized folders (Images, Documents, Videos, etc.) to maintain a clean workspace.

## Features

- **Real-time Monitoring:** Uses `fs.watch` to detect file changes immediately upon download.
- **Automated Sorting:** Categorizes files into Images, Documents, Videos, Audio, Installers, Archives, and Code.
- **Concurrency Handling:** Implements debounce logic and retry mechanisms to handle file locks during active downloads.
- **Background Service:** Designed to run indefinitely using PM2 for process management and auto-restart on system reboot.
- **Resource Efficient:** Optimized for low CPU and memory usage using event-driven architecture.

## Tech Stack

- **Runtime:** Node.js
- **Process Manager:** PM2
- **Core Modules:** fs, path

## Installation & Usage

1. **Clone the repository**
```bash
git clone <This Repo URL>
cd downloads-organizer
```

2. **Configure the Target Path**

Open `index.js` and update the `TARGET_FOLDER` variable:

```js
const TARGET_FOLDER = '/Users/yourname/Downloads';
```

3. **Install PM2 (Global)**

If you do not have PM2 installed globally:

```bash
npm install -g pm2
```

4. **Start the Service**

Run the script as a background process:

```bash
pm2 start index.js --name "download-cleaner"
```

5. **Enable Startup Persistence**

To ensure the script runs after a system reboot:

```bash
pm2 startup
pm2 save
```

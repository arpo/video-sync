# Multi-Screen Video Sync Tool

## Description

This is a web-based tool designed for synchronizing multiple video playbacks across different screens, primarily intended for use in live music performances. It allows users to load multiple video files, designate a master video, and synchronize playback across all loaded videos.

## Features

- Drag and drop interface for loading video files
- Automatic synchronization of multiple video playbacks
- Master video control with slave video synchronization
- Preview thumbnails for loaded videos
- Progress bar for seeking through videos
- Play/Pause toggle for all videos simultaneously
- Reset functionality to clear all loaded videos
- Responsive design for preview thumbnails

## Requirements

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (e.g., Node.js with http-server, Python's SimpleHTTPServer, or any other local server of your choice)

## Setup and Running

1. Clone or download this repository to your local machine.

2. Ensure you have a local web server installed. If you don't have one, you can easily set up `http-server` using Node.js:
   
   ```
   npm install -g http-server
   ```

3. Navigate to the project directory in your terminal or command prompt.

4. Start your local web server. If using `http-server`, simply run:
   
   ```
   http-server
   ```

5. Open your web browser and go to the address provided by your local server (typically `http://localhost:8080` or similar).

6. You should now see the Multi-Screen Video Sync Tool interface in your browser.

## Usage

1. Drag and drop video files onto the designated drop zone in the interface.

2. Click "Open All Videos" to open each video in a separate window. The first video will be designated as the master video.

3. Use the play/pause button to control playback of all videos simultaneously.

4. The progress bar allows you to seek through the videos. All videos will sync to the new position.

5. To reset and clear all videos, click the "Reset" button.

## Notes

- Ensure your browser allows pop-ups for this site, as each video opens in a new window.
- The tool works best when all videos are of the same length. A warning will be displayed if video lengths differ significantly.
- This tool is designed for local use and may not work correctly if hosted on a remote server due to security restrictions in modern browsers.

## Troubleshooting

If you encounter any issues:
- Make sure your browser is up to date
- Check the browser's console for any error messages
- Ensure all video files are supported formats for web playback (e.g., MP4 with H.264 codec)

For any persistent issues or feature requests, please open an issue in the project repository.


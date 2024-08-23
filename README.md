# SyncWave: Multi-Screen Video Sync & Performance Visual Tool

## Description

SyncWave is a powerful web-based tool designed for synchronizing multiple video playbacks across different screens, primarily intended for use in live music performances. It allows users to load multiple video files, designate a master video or audio, and synchronize playback across all loaded videos. SyncWave includes advanced features such as audio analysis, MIDI control, and dynamic visual effects for enhancing live performances.

## Features

- Drag and drop interface for loading video and audio files
- Automatic synchronization of multiple video playbacks
- Master video/audio control with slave video synchronization
- Preview thumbnails for loaded videos
- Progress bar for seeking through videos
- Play/Pause toggle for all videos simultaneously
- Reset functionality to clear all loaded media
- Responsive design for preview thumbnails
- Audio analysis with visual feedback (background color changes)
- Dynamic flash effect for creating visual impact on performers
- MIDI control support for various parameters
- Strobe effect with adjustable duration
- Progressive Web App (PWA) support for installation on devices

## Requirements

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (e.g., Node.js with http-server, Python's SimpleHTTPServer, or any other local server of your choice)
- (Optional) MIDI controller for enhanced control

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

1. Drag and drop video or audio files onto the designated drop zone in the interface.

2. Click "Open All Videos" to open each video in a separate window. The first video or audio file will be designated as the master.

3. Use the play/pause button to control playback of all media simultaneously.

4. The progress bar allows you to seek through the media. All videos will sync to the new position.

5. Adjust audio analysis parameters (intensity threshold, bass range, etc.) using the provided controls.

6. If a MIDI controller is connected, use it to control various parameters in real-time.

7. Use the strobe effect button for visual impact during performances.

8. To reset and clear all media, click the "Reset" button.

## Flash Effect for Performers

SyncWave includes a dynamic flash effect designed to create visually stunning moments during live performances:

- Real-time audio analysis focuses on bass frequencies to generate color flashes on the screen.
- A dedicated toggle allows you to quickly enable or disable all flash effects.
- When projected onto the performer or used as stage lighting, these flashes create a synchronized visual effect that matches the music.
- Adjustable parameters include:
  - Intensity Threshold: Determines how strong the audio needs to be to trigger a flash
  - Hard Flash Threshold: Sets the point at which the flash reaches full intensity
  - Hue: Allows you to change the color of the flash
  - Saturation: Controls the vibrancy of the color
- The strobe effect can be used for more intense moments, creating rapid flashes of white light.

To achieve the best results:

1. Use the flash effects toggle to quickly enable or disable all visual effects.
2. Position your display or projector to illuminate the performer or the performance area.
3. Adjust the flash effect parameters to match the style and intensity of the music.
4. Use the MIDI controls for real-time adjustments during the performance.
5. Combine with video playback for complex, multimedia performances.

## MIDI Control

SyncWave supports MIDI control for various parameters and actions. Connect a MIDI controller to your computer and use the following mappings:

- Slider 1 (CC 114): Intensity Threshold
- Slider 2 (CC 18): Hard Flash Threshold
- Slider 3 (CC 19): Hue
- Slider 4 (CC 16): Saturation
- Slider 5 (CC 17): [Available for future use]
- Slider 6 (CC 91): Page Scrolling
- Button 1 (Note 44): Trigger Strobe Effect
- Button 2 (Note 45): Toggle Flash Effects

Scrolling Control:
- Use Slider 6 to control page scrolling
- The middle position of the slider (around 63) represents no scrolling
- Moving the slider up from the middle position scrolls the page down
- Moving the slider down from the middle position scrolls the page up
- The further you move the slider from the center, the faster the scrolling speed
- Return the slider to the middle position to stop scrolling

Note: MIDI mappings can be customized in the `main.js` file. The current maximum scroll speed is set to 20 pixels every 50 milliseconds, but you can adjust these values in the `main.js` file to suit your preferences.


## PWA Installation

This application can be installed as a Progressive Web App. To install:

1. Open the application in a supported browser (e.g., Chrome, Edge).
2. Look for the install prompt in the address bar or browser menu.
3. Follow the prompts to install the app on your device.

## Safety Considerations

When using the flash and strobe effects:
- Inform all performers and audience members about the use of these effects before the performance.
- Be aware that rapidly changing lights or intense strobe effects can cause discomfort or trigger photosensitive epilepsy in some individuals.
- Always provide warnings and, if possible, areas of the venue with reduced exposure to these effects.
- Monitor the comfort level of performers and be ready to adjust or disable effects if necessary.

## Notes

- Ensure your browser allows pop-ups for this site, as each video opens in a new window.
- The tool works best when all videos are of the same length. A warning will be displayed if video lengths differ significantly.
- This tool is designed for local use and may not work correctly if hosted on a remote server due to security restrictions in modern browsers.
- For the best experience with audio analysis and MIDI control, use Google Chrome or Microsoft Edge.

## Troubleshooting

If you encounter any issues:
- Make sure your browser is up to date
- Check the browser's console for any error messages
- Ensure all video files are supported formats for web playback (e.g., MP4 with H.264 codec)
- For MIDI issues, check that your MIDI controller is properly connected and recognized by your computer

For any persistent issues or feature requests, please open an issue in the project repository.

## Contributing

Contributions to improve the Multi-Screen Video Sync Tool are welcome. Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

[Specify your license here, e.g., MIT, GPL, etc.]
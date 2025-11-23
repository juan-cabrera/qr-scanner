# QR Code Scanner for Firefox

A Firefox extension that allows you to scan QR codes using your webcam or capture them directly from your screen.

## Features

- 📷 **Live Camera Scanning** - Use your webcam to scan QR codes in real-time
- 🖥️ **Screen Capture** - Capture and scan QR codes from any window, tab, or your entire screen
- 🔗 **Automatic URL Opening** - Detected URLs are automatically opened in a new tab
- 🎯 **Smart Detection** - Multiple image processing techniques for reliable QR code recognition
- ✨ **Visual Feedback** - See the captured image to verify what was scanned

## Installation

### From Firefox Add-ons (Recommended)
*Coming soon - pending Mozilla review*

### Manual Installation (Development)
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension folder

### Build from Source
```bash
# Install dependencies
npm install -g web-ext

# Clone the repository
git clone https://github.com/yourusername/qr-scanner.git
cd qr-scanner

# Build the extension
web-ext build

# The XPI file will be in web-ext-artifacts/
```

## Usage

### Camera Scanning
1. Click the extension icon in your Firefox toolbar
2. Click the "Start Camera" button
3. Allow camera access when prompted
4. Point your camera at a QR code
5. The URL will automatically open when detected

### Screen Capture
1. Click the extension icon in your Firefox toolbar
2. Click the "Capture Screen" button
3. Select the window, tab, or screen containing the QR code
4. The extension will analyze the capture and open any detected URL

## Permissions

This extension requires the following permissions:

- **`tabs`** - To open URLs found in QR codes in new tabs

**Note:** Camera and screen capture permissions are requested only when you use those features (not automatically granted at installation).

## Privacy

- No data is collected or transmitted
- All QR code processing happens locally in your browser
- Camera and screen captures are processed in real-time and not stored
- No analytics or tracking

## Technical Details

- **Manifest Version:** 2
- **Minimum Firefox Version:** 145.0
- **QR Code Detection:** [jsQR](https://github.com/cozmo/jsQR) library (Apache 2.0)
- **Image Processing:** Multiple techniques including grayscale conversion, binary threshold, and contrast enhancement

## File Structure

```
qr-scanner/
├── manifest.json       # Extension configuration
├── background.js       # Background script to handle extension icon clicks
├── scanner.html        # Main UI
├── scanner.js          # Camera and QR scanning logic
├── jsQR.js             # QR code detection library
├── icon.png            # Extension icon
├── icon-96.png         # Extension icon
├── LICENSE             # MIT License
└── README.md           # This file
```

## Development

### Prerequisites
- Firefox 145.0 or higher
- Node.js and npm (for web-ext tool)

### Local Development
```bash
# Run the extension in a temporary Firefox profile
web-ext run

# Lint the extension
web-ext lint

# Build for distribution
web-ext build
```

## Credits

- QR Code Detection: [jsQR](https://github.com/cozmo/jsQR) by Cozmo (Apache 2.0 License)
- Development Assistance: Claude AI by Anthropic
- Developer: Juan Cabrera

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

If you encounter any issues or have suggestions:
- Open an issue on [GitHub](https://github.com/yourusername/qr-scanner/issues)
- Contact: your.email@example.com

## Changelog

### Version 1.0.0 (2025-11-23)
- Initial release
- Camera-based QR code scanning
- Screen capture QR code scanning
- Automatic URL detection and opening
- Multiple image processing techniques for better detection

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

Potential features for future versions:
- Support for other barcode formats
- QR code generation
- History of scanned codes
- Copy to clipboard option
- Custom URL handling preferences

---

Made with ❤️ using Firefox WebExtensions API

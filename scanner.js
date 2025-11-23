// Check if jsQR is loaded
if (typeof jsQR === 'undefined') {
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;"><h2>Error: jsQR library not found!</h2><p>Please download jsQR.js from:<br><a href="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js" target="_blank">https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js</a></p><p>Save it as "jsQR.js" in your extension folder.</p></div>';
  throw new Error('jsQR library not loaded');
}

let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let status = document.getElementById('status');
let startBtn = document.getElementById('startBtn');
let captureBtn = document.getElementById('captureBtn');
let scanning = false;
let stream = null;

startBtn.addEventListener('click', () => {
  if (!scanning) {
    startScanning();
  } else {
    stopScanning();
  }
});

captureBtn.addEventListener('click', captureScreen);

async function startScanning() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    video.srcObject = stream;
    scanning = true;
    startBtn.textContent = 'Stop Scanning';
    status.textContent = 'Scanning for QR codes...';
    status.className = '';
    
    requestAnimationFrame(tick);
  } catch (err) {
    status.textContent = 'Error: Could not access camera. Please grant camera permission.';
    status.className = 'error';
    console.error(err);
  }
}

function stopScanning() {
  scanning = false;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.srcObject = null;
  startBtn.textContent = 'Start Camera';
  status.textContent = 'Scanning stopped';
  status.className = '';
}

async function captureScreen() {
  try {
    status.textContent = 'Select the area with the QR code...';
    status.className = '';
    canvas.classList.remove('show');
    
    // Stop camera if running
    if (scanning) {
      stopScanning();
    }
    
    // Capture screen
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' }
    });
    
    // Create a video element to capture the frame
    const videoCapture = document.createElement('video');
    videoCapture.srcObject = mediaStream;
    videoCapture.play();
    
    // Wait for video to be ready
    await new Promise(resolve => {
      videoCapture.onloadedmetadata = resolve;
    });
    
    // Small delay to ensure frame is captured
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Draw to canvas
    canvas.width = videoCapture.videoWidth;
    canvas.height = videoCapture.videoHeight;
    ctx.drawImage(videoCapture, 0, 0);
    
    // Show the captured image
    canvas.classList.add('show');
    
    // Stop the screen capture
    mediaStream.getTracks().forEach(track => track.stop());
    
    status.textContent = 'Analyzing captured image...';
    
    // Try multiple scanning approaches
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Attempt 1: Direct scan
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    
    // Attempt 2: Try with grayscale conversion
    if (!code) {
      const grayData = toGrayscale(imageData);
      code = jsQR(grayData.data, grayData.width, grayData.height, {
        inversionAttempts: "attemptBoth",
      });
    }
    
    // Attempt 3: Try with threshold
    if (!code) {
      const thresholdData = applyThreshold(imageData);
      code = jsQR(thresholdData.data, thresholdData.width, thresholdData.height, {
        inversionAttempts: "attemptBoth",
      });
    }
    
    // Attempt 4: Try with contrast enhancement
    if (!code) {
      const enhancedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      enhanceContrast(enhancedData);
      code = jsQR(enhancedData.data, enhancedData.width, enhancedData.height, {
        inversionAttempts: "attemptBoth",
      });
    }
    
    if (code) {
      handleQRCode(code.data);
    } else {
      status.textContent = 'No QR code found. Make sure the QR code is clearly visible and try selecting just the document/window containing it.';
      status.className = 'error';
    }
    
  } catch (err) {
    canvas.classList.remove('show');
    if (err.name === 'NotAllowedError') {
      status.textContent = 'Screen capture cancelled';
      status.className = '';
    } else {
      status.textContent = 'Error capturing screen: ' + err.message;
      status.className = 'error';
    }
    console.error(err);
  }
}

function tick() {
  if (!scanning) return;
  
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      handleQRCode(code.data);
      return;
    }
  }
  
  requestAnimationFrame(tick);
}

function handleQRCode(data) {
  status.textContent = `Found: ${data}`;
  status.className = 'success';
  
  // Check if it's a URL
  if (data.startsWith('http://') || data.startsWith('https://')) {
    browser.tabs.create({ url: data });
    status.textContent = `Opening: ${data}`;
    setTimeout(() => stopScanning(), 1000);
  } else if (data.includes('.') && !data.includes(' ')) {
    // Likely a URL without protocol
    browser.tabs.create({ url: 'https://' + data });
    status.textContent = `Opening: https://${data}`;
    setTimeout(() => stopScanning(), 1000);
  } else {
    status.textContent = `QR code found but not a URL: ${data}`;
    setTimeout(() => {
      if (scanning) {
        status.textContent = 'Scanning for QR codes...';
        status.className = '';
        requestAnimationFrame(tick);
      }
    }, 2000);
  }
}

// Enhance image contrast for better QR code detection
function enhanceContrast(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    // Apply contrast enhancement
    const contrast = 1.5;
    let enhanced = (gray - 128) * contrast + 128;
    
    // Clamp values
    enhanced = Math.max(0, Math.min(255, enhanced));
    
    data[i] = enhanced;
    data[i + 1] = enhanced;
    data[i + 2] = enhanced;
  }
}

// Convert image to grayscale
function toGrayscale(imageData) {
  const newData = ctx.createImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const newPixels = newData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    newPixels[i] = gray;
    newPixels[i + 1] = gray;
    newPixels[i + 2] = gray;
    newPixels[i + 3] = data[i + 3];
  }
  
  return newData;
}

// Apply binary threshold
function applyThreshold(imageData) {
  const newData = ctx.createImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const newPixels = newData.data;
  
  // Calculate threshold using Otsu's method (simplified)
  let sum = 0;
  let count = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum += gray;
    count++;
  }
  
  const threshold = sum / count;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const binary = gray > threshold ? 255 : 0;
    newPixels[i] = binary;
    newPixels[i + 1] = binary;
    newPixels[i + 2] = binary;
    newPixels[i + 3] = data[i + 3];
  }
  
  return newData;
}
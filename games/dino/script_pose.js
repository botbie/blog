// DOM Elements
const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');
const modeSelect = document.getElementById('mode-select');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const statusElement = document.getElementById('status');
const jumpIndicatorElement = document.getElementById('jump-indicator');
const gameCanvas = document.querySelector('.runner-canvas');

// Constants
const INDEX_TIP_ID = 8;
const LEFT_SHOULDER_ID = 11;
const JUMP_THRESHOLD = 0.04;
const DUCK_THRESHOLD = 0.02;
const DUCK_PROXIMITY_THRESHOLD = 0.3;

// State
let prevY = null;
let lastHeadY = null;
let hands = null;
let pose = null;
let activeDetector = null;
let camera = null;
let currentMode = 'pose';
let jumpTimeout = null;
let isDuckTriggered = false;

// Utility Functions
function getLandmarkY(landmarks, id) {
  return landmarks?.[id]?.y ?? null;
}

function getDistance(a, b) {
  if (!a || !b) return Infinity;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function dispatchKeyEvent(type, key, code, keyCode) {
  const event = new KeyboardEvent(type, {
    key, code, keyCode, which: keyCode,
    bubbles: true, cancelable: true
  });
  gameCanvas.dispatchEvent(event);
}

function makeJump() {
  const runner = window.Runner?.instance_;
  if (!runner) return;
  if (runner.crashed) return runner.restart();
  dispatchKeyEvent('keydown', ' ', 'Space', 32);
}

function triggerDuck() {
  isDuckTriggered = true;
  dispatchKeyEvent('keydown', 'ArrowDown', 'ArrowDown', 40);
  jumpIndicatorElement.textContent = 'DUCK!';
  console.log('⬇️ Duck triggered');
}

function resetDuck() {
  isDuckTriggered = false;
  dispatchKeyEvent('keyup', 'ArrowDown', 'ArrowDown', 40);
  jumpIndicatorElement.textContent = '\u00A0';
}

function detectJump(y) {
  if (prevY !== null && y !== null && (y - prevY) < -JUMP_THRESHOLD) {
    console.log('⬆️ Jump');
    jumpIndicatorElement.textContent = 'JUMP!';
    makeJump();
    clearTimeout(jumpTimeout);
    jumpTimeout = setTimeout(() => jumpIndicatorElement.textContent = '\u00A0', 700);
  }
  prevY = y;
}

function detectDucking(landmarks) {
  if (!landmarks) return;
  const nose = landmarks[0];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  const leftDist = getDistance(nose, leftWrist);
  const rightDist = getDistance(nose, rightWrist);

  if (leftDist < DUCK_PROXIMITY_THRESHOLD || rightDist < DUCK_PROXIMITY_THRESHOLD) {
    triggerDuck();
  } else if (isDuckTriggered) {
    resetDuck();
  }
}

// Drawing Callback
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  let y = null;

  if (currentMode === 'hand' && results.multiHandLandmarks?.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
    drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
    y = getLandmarkY(landmarks, INDEX_TIP_ID);
  } else if (currentMode === 'pose' && results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FFFF', lineWidth: 4 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FFFF00', lineWidth: 1, radius: 3 });
    y = getLandmarkY(results.poseLandmarks, LEFT_SHOULDER_ID);
  }

  if (y !== null) detectJump(y);
  detectDucking(results.poseLandmarks);

  canvasCtx.restore();
}

// Model Initialization
function initHands() {
  hands = new Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
  hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.5 });
  hands.onResults(onResults);
  return hands;
}

function initPose() {
  pose = new Pose({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
  pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.5 });
  pose.onResults(onResults);
  return pose;
}

// Camera Control
async function startWebcam() {
  if (camera?.g?.srcObject) {
    stopWebcam();
    await new Promise(r => setTimeout(r, 100));
  }

  prevY = null;
  statusElement.textContent = `🚀 Starting Dino Controller in '${currentMode}' mode...`;

  activeDetector = currentMode === 'hand' ? (hands || initHands()) : (pose || initPose());

  camera = new Camera(videoElement, {
    onFrame: async () => {
      if (activeDetector && videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        await activeDetector.send({ image: videoElement });
      }
    },
    width: 640, height: 480
  });

  try {
    await camera.start();
    statusElement.textContent = `Jumping to make dino jump! Hold your head with hands to duck.`;
  } catch (err) {
    statusElement.textContent = `❌ Error: ${err.message}`;
  }
}

function stopWebcam() {
  statusElement.textContent = 'Stopping webcam...';
  if (camera) {
    camera.stop();
    videoElement.srcObject?.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
    camera = null;
  }
  prevY = null;
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  jumpIndicatorElement.textContent = '\u00A0';
  statusElement.textContent = '👋 Exited Dino Controller. Webcam stopped.';
  startButton.disabled = false;
  stopButton.disabled = true;
  modeSelect.disabled = false;
}

// Setup
videoElement.addEventListener('loadeddata', () => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
});

if (navigator.mediaDevices?.getUserMedia) {
  startWebcam();
}

statusElement.textContent = "Status: Idle. Select mode and click Start.";

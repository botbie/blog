// --- Global Constants and Variables ---
const CLASS_NAMES = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise'];
let emotionModel = null;
let faceCascade = null;
const videoCanvas = document.getElementById('videoCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');
const videoCtx = videoCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');

let streaming = false;
let stream = null;

// DOM elements
const statusElement = document.getElementById('status');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const fileInputElement = document.getElementById('fileInput');
const imageResultElement = document.getElementById('imageResult');

// --- Entry point ---
window.onload = () => {
    if (typeof cv !== 'undefined' && typeof tf !== 'undefined') {
        main();
    } else {
        setTimeout(() => window.onload(), 50);
    }
};

async function main() {
    statusElement.textContent = 'Loading models...';
    try {
        emotionModel = await tf.loadLayersModel('model_js/model.json');
        statusElement.textContent = 'Emotion model loaded. Loading face detector...';

        const response = await fetch('model_js/haarcascade_frontalface_default.xml');
        if (!response.ok) throw new Error('Failed to load face cascade');
        const data = new Uint8Array(await response.arrayBuffer());
        cv.FS_createDataFile('/', 'face.xml', data, true, false, false);

        faceCascade = new cv.CascadeClassifier();
        if (!faceCascade.load('face.xml')) throw new Error('Failed to load cascade into OpenCV');

        statusElement.textContent = 'Models loaded. Ready to start!';
        startButton.disabled = false;
    } catch (e) {
        console.error(e);
        statusElement.textContent = `Error: ${e.message}`;
        statusElement.style.color = 'red';
    }
}

// --- Event Listeners ---
startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);
fileInputElement.addEventListener('change', processImage);

function startCamera() {
    if (streaming) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
        stream = s;
        video.srcObject = stream;
        video.play();
    }).catch(err => {
        console.error("Camera Error:", err);
    });

    video.addEventListener('canplay', () => {
        if (!streaming) {
            streaming = true;
            startButton.disabled = true;
            stopButton.disabled = false;
            mainLoop();
        }
    }, { once: true });
}

function stopCamera() {
    if (!streaming) return;
    streaming = false;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startButton.disabled = false;
    stopButton.disabled = true;
}

// --- Main Loop with Fixes and Improvements ---
async function mainLoop() {
    overlayCtx.strokeStyle = 'lime';
    overlayCtx.lineWidth = 2;
    overlayCtx.fillStyle = 'lime';
    overlayCtx.font = 'bold 18px Arial';

    while (streaming) {
        try {
            // 1. Draw the video frame to the video canvas
            videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);

            // 2. Wait for canvas to flush
            await new Promise(requestAnimationFrame);

            // 3. Detect using videoCanvas
            const detections = await detectAndPredictFromCanvas(videoCanvas);

            // 4. Clear overlay before drawing
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

            // 5. Draw boxes
            for (const { box, prediction } of detections) {
                overlayCtx.strokeRect(box.x, box.y, box.width, box.height);
                const label = `${prediction.emotion} (${prediction.confidence.toFixed(2)})`;
                overlayCtx.fillText(label, box.x, box.y - 10);
            }

        } catch (error) {
            console.error("Error in main loop:", error);
        }

        await tf.nextFrame();
    }
}


// --- Face + Emotion Detection from Canvas ---
async function detectAndPredictFromCanvas(canvasEl) {
    const src = cv.imread(canvasEl);
    const results = await detectFacesAndPredict(src);
    src.delete();
    return results;
}


// --- Face + Emotion Detection from Uploaded Image ---
async function detectAndPredictFromImage(img) {
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.drawImage(img, 0, 0);
    await new Promise(requestAnimationFrame);
    const src = cv.imread(tmpCanvas);
    const results = await detectFacesAndPredict(src);
    src.delete();
    return results;
}

// --- Actual Prediction Logic ---
async function detectFacesAndPredict(src) {
    const gray = new cv.Mat();
    const faces = new cv.RectVector();
    const results = [];

    try {
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        faceCascade.detectMultiScale(gray, faces, 1.1, 5, 0, new cv.Size(30, 30));

        const faceRects = [];
        for (let i = 0; i < faces.size(); i++) {
            faceRects.push(faces.get(i));
        }

        const promises = faceRects.map(async (rect) => {
            let face = gray.roi(rect);
            cv.resize(face, face, new cv.Size(48, 48));

            const input = tf.tidy(() => {
                const tensor = tf.tensor(face.data, [48, 48, 1], 'float32').div(255);
                return tensor.expandDims(0);
            });

            const prediction = await emotionModel.predict(input).data();
            const maxIndex = prediction.indexOf(Math.max(...prediction));

            face.delete();
            input.dispose();

            return {
                box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                prediction: {
                    emotion: CLASS_NAMES[maxIndex],
                    confidence: prediction[maxIndex]
                }
            };
        });

        return await Promise.all(promises);
    } finally {
        gray.delete();
        faces.delete();
    }
}

// --- Upload and Annotate Image ---
async function processImage(event) {
    console.log('Processing uploaded image...');
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
            const detections = await detectAndPredictFromImage(img);

            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = img.width;
            outputCanvas.height = img.height;
            const outputCtx = outputCanvas.getContext('2d');
            outputCtx.drawImage(img, 0, 0);

            for (const { box, prediction } of detections) {
                outputCtx.strokeStyle = 'lime';
                outputCtx.lineWidth = 2;
                outputCtx.strokeRect(box.x, box.y, box.width, box.height);
                outputCtx.fillStyle = 'lime';
                outputCtx.font = 'bold 18px Arial';
                outputCtx.fillText(`${prediction.emotion} (${prediction.confidence.toFixed(2)})`, box.x, box.y - 10);
            }

            imageResultElement.innerHTML = '';
            imageResultElement.appendChild(outputCanvas);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

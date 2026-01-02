const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const statusIndicator = document.getElementById('statusIndicator');
const gestureIndicator = document.getElementById('gestureIndicator');
const categoryScreen = document.getElementById('categoryScreen');
const learningScreen = document.getElementById('learningScreen');

let gestureRecognizer;
const runningMode = "VIDEO";

let allFlashcards = [];
let categories = [];
let flashcards = [];
let currentCategory = null;
let currentCardIndex = 0;
let showingGerman = true;

// Category navigation state
let currentCategoryIndex = 0;

const GESTURE_COOLDOWN = 800;
let lastGesture = null;
let lastGestureTime = 0;

const GESTURES = {
    'Thumb_Up': '👍',
    'Thumb_Down': '👎',
    'Open_Palm': '✋',
    'Victory': '✌️',
    'Closed_Fist': '✊',
    'ILoveYou': '☝️'
};

async function loadFlashcards() {
    try {
        const response = await fetch('data/german_flashcard_map.json');
        const data = await response.json();

        // Process the w2f (word-to-flashcard) section
        const w2f = data.w2f;

        for (const [germanWord, flashcardData] of Object.entries(w2f)) {
            allFlashcards.push({
                german: flashcardData.german,
                english: flashcardData.english,
                image_local: flashcardData.image_local,
                image_url: flashcardData.image_url
            });
        }

        extractCategories(data);
        renderCategories();
    } catch (error) {
        console.error('Error loading flashcards:', error);
        statusIndicator.textContent = '❌ Error loading data';
    }
}

function extractCategories(data) {

    categorylist = data.categories;
    for (const item of categorylist) {
        flashcards_in_category = data[item];
        cards =  [];
        for (const flashcard of flashcards_in_category) {
            cards.push(data.w2f[flashcard]);
        }
        categories.push({
            name: item,
            count: data[item].length,
            cards: cards
        })
    }
}

function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';

    categories.forEach((category, index) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        if (index === currentCategoryIndex) {
            card.classList.add('highlighted');
        }
        card.innerHTML = `
            <div class="category-card-name">${category.name.replace('German ', '').replace(' Flashcards', '')}</div>
            <div class="category-card-count">${category.count} cards</div>
        `;
        card.onclick = () => selectCategory(category.name);
        grid.appendChild(card);
    });
}

function highlightCategory(index) {
    currentCategoryIndex = index;
    renderCategories();

    // Scroll to highlighted category
    const cards = document.querySelectorAll('.category-card');
    if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function nextCategory() {
    if (categories.length === 0) return;
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    highlightCategory(currentCategoryIndex);
}

function previousCategory() {
    if (categories.length === 0) return;
    currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
    highlightCategory(currentCategoryIndex);
}

function selectCurrentCategory() {
    if (categories.length === 0) return;
    const category = categories[currentCategoryIndex];
    selectCategory(category.name);
}

function selectCategory(categoryName) {
    currentCategory = categoryName;
    category = categories.filter(category=> category.name===categoryName)[0];
    flashcards = category.cards;
    currentCardIndex = 0;
    showingGerman = true;

    categoryScreen.style.display = 'none';
    learningScreen.style.display = 'block';

    updateCard();
}

window.backToCategories = function () {
    categoryScreen.style.display = 'block';
    learningScreen.style.display = 'none';
    currentCategory = null;
    flashcards = [];
    currentCategoryIndex = 0;
    highlightCategory(0);
}

function updateCard() {
    if (flashcards.length === 0) return;

    const card = flashcards[currentCardIndex];
    const text = showingGerman ? card.german : card.english;
    // Use image_url if available, otherwise fall back to image_local
    const imgurl = card.image_url || card.image_local;

    document.getElementById('category').textContent = currentCategory;
    document.getElementById('text').textContent = text;
    document.getElementById('image').src = imgurl;

    if (imgurl && !showingGerman) {
        document.getElementById('image').style.display = 'block';
    } else {
        document.getElementById('image').style.display = 'none';
    }
    document.getElementById('progress').textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
}

function nextCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    showingGerman = true;
    updateCard();
}

function previousCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    showingGerman = true;
    updateCard();
}

function flipCard() {
    if (flashcards.length === 0) return;
    showingGerman = !showingGerman;
    updateCard();
}

window.toggleHelp = function () {
    const helpPanel = document.getElementById('helpPanel');
    helpPanel.classList.toggle('show');
}

function showGesture(gesture, emoji) {
    gestureIndicator.textContent = `${emoji} ${gesture}`;
    gestureIndicator.style.display = 'block';
    setTimeout(() => {
        gestureIndicator.style.display = 'none';
    }, 1000);
}

function handleGesture(gestureName, handLandmarks) {
    if (!gestureName) return;

    const now = Date.now();
    const emoji = GESTURES[gestureName] || '❓';

    // Check if we're on category screen or learning screen
    const onCategoryScreen = categoryScreen.style.display !== 'none';

    // Pointing Up - go back to categories (only works on learning screen)
    if (gestureName === 'ILoveYou') {
        if (learningScreen.style.display !== 'none') {
            if (gestureName !== lastGesture || now - lastGestureTime >= GESTURE_COOLDOWN) {
                showGesture('Categories', '☝️');
                backToCategories();
                lastGesture = gestureName;
                lastGestureTime = now;
            }
        }
        return;
    }

    if (gestureName === lastGesture && now - lastGestureTime < GESTURE_COOLDOWN) {
        return;
    }

    // Handle gestures based on current screen
    if (onCategoryScreen) {
        // Category selection gestures
        switch (gestureName) {
            case 'Thumb_Up':
                showGesture('Next Category', '👍');
                nextCategory();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;

            case 'Thumb_Down':
                showGesture('Previous Category', '👎');
                previousCategory();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;

            case 'Open_Palm':
                showGesture('Select Category', '✋');
                selectCurrentCategory();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;

            case 'Victory':
                showGesture('Toggle Help', '✌️');
                toggleHelp();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;
        }
    } else {
        // Learning screen gestures
        switch (gestureName) {
            case 'Thumb_Up':
                showGesture('Next Card', '👍');
                nextCard();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;

            case 'Thumb_Down':
                showGesture('Previous Card', '👎');
                previousCard();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;

            case 'Open_Palm':
                showGesture('Flip Card', '✋');
                flipCard();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;

            case 'Victory':
                showGesture('Toggle Help', '✌️');
                toggleHelp();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;
        }
    }

    if (gestureName !== lastGesture) {
        setTimeout(() => {
            if (lastGesture === gestureName) {
                lastGesture = null;
            }
        }, GESTURE_COOLDOWN);
    }
}

async function predictWebcam() {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    let startTimeMs = performance.now();

    const results = gestureRecognizer.recognizeForVideo(videoElement, startTimeMs);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.landmarks && results.landmarks.length > 0) {
        const drawingUtils = new window.DrawingUtils(canvasCtx);

        for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(
                landmarks,
                window.GestureRecognizer.HAND_CONNECTIONS,
                { color: '#00FF00', lineWidth: 3 }
            );
            drawingUtils.drawLandmarks(landmarks, {
                color: '#FF0000',
                lineWidth: 2,
                radius: 5
            });
        }

        if (results.gestures && results.gestures.length > 0) {
            const gesture = results.gestures[0][0];
            if (gesture.score > 0.7) {
                handleGesture(gesture.categoryName, results.landmarks[0]);
            }
        }

        statusIndicator.textContent = '✓ Hand detected';
        statusIndicator.style.background = 'rgba(76, 175, 80, 0.9)';
        statusIndicator.style.color = 'white';
    } else {
        statusIndicator.textContent = '✋ Show your hand';
        statusIndicator.style.background = 'rgba(255, 255, 255, 0.9)';
        statusIndicator.style.color = '#667eea';
    }

    canvasCtx.restore();
    window.requestAnimationFrame(predictWebcam);
}

async function initializeGestureRecognizer() {
    statusIndicator.textContent = 'Loading AI model...';

    const visionModule = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8');
    const { GestureRecognizer, FilesetResolver, DrawingUtils } = visionModule;

    window.DrawingUtils = DrawingUtils;
    window.GestureRecognizer = GestureRecognizer;

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
    );

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    statusIndicator.textContent = 'Starting camera...';

    const constraints = {
        video: { width: 1280, height: 720 }
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        videoElement.srcObject = stream;
        videoElement.addEventListener("loadeddata", () => {
            statusIndicator.textContent = '📷 Camera ready';
            predictWebcam();
        });
    }).catch((err) => {
        statusIndicator.textContent = '❌ Camera access denied';
        console.error('Camera error:', err);
    });
}

// Initialize app
loadFlashcards();
initializeGestureRecognizer();
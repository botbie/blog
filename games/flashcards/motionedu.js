const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const statusIndicator = document.getElementById('statusIndicator');
const gestureIndicator = document.getElementById('gestureIndicator');
const categoryScreen = document.getElementById('categoryScreen');
const modeScreen = document.getElementById('modeScreen');
const learningScreen = document.getElementById('learningScreen');
const testScreen = document.getElementById('testScreen');
const resultsScreen = document.getElementById('resultsScreen');

let gestureRecognizer;
const runningMode = "VIDEO";

let allFlashcards = [];
let categories = [];
let flashcards = [];
let currentCategory = null;
let currentCardIndex = 0;
let showingGerman = true;

// Mode selection state
let selectedMode = null; // 'learn' or 'test'
let currentModeIndex = 0; // 0 = learn, 1 = test

// Test mode state
let testQuestions = [];
let currentTestIndex = 0;
let testScore = 0;
let correctAnswer = null; // 'left' or 'right'
let answeredCorrectly = null;

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
    'ILoveYou': '🤟',
    'Pointing_Up': '☝️'
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
        cards = [];
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
    category = categories.filter(category => category.name === categoryName)[0];
    flashcards = category.cards;
    currentCardIndex = 0;
    showingGerman = true;

    // Show mode selection screen
    categoryScreen.style.display = 'none';
    modeScreen.style.display = 'block';
    currentModeIndex = 0;
    highlightMode(0);
}

function highlightMode(index) {
    currentModeIndex = index;
    const learnCard = document.getElementById('learnModeCard');
    const testCard = document.getElementById('testModeCard');

    learnCard.classList.remove('highlighted');
    testCard.classList.remove('highlighted');

    if (index === 0) {
        learnCard.classList.add('highlighted');
    } else {
        testCard.classList.add('highlighted');
    }
}

function selectMode(mode) {
    selectedMode = mode;

    if (mode === 'learn') {
        startLearningMode();
    } else if (mode === 'test') {
        startTestMode();
    }
}

function startLearningMode() {
    modeScreen.style.display = 'none';
    learningScreen.style.display = 'block';
    currentCardIndex = 0;
    showingGerman = true;
    updateCard();
}

function startTestMode() {
    modeScreen.style.display = 'none';
    testScreen.style.display = 'block';

    // Generate test questions
    generateTestQuestions();
    currentTestIndex = 0;
    testScore = 0;
    document.getElementById('scoreValue').textContent = testScore;
    document.getElementById('totalQuestions').textContent = testQuestions.length;

    showTestQuestion();
}

function generateTestQuestions() {
    testQuestions = [];

    // Shuffle the flashcards
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(shuffled.length, 10); i++) {
        const correctCard = shuffled[i];

        // Get a random incorrect card from the same category
        let incorrectCard;
        do {
            incorrectCard = flashcards[Math.floor(Math.random() * flashcards.length)];
        } while (incorrectCard.german === correctCard.german);

        // Randomly assign correct answer to left or right
        const correctPosition = Math.random() < 0.5 ? 'left' : 'right';

        testQuestions.push({
            german: correctCard.german,
            correctCard: correctCard,
            incorrectCard: incorrectCard,
            correctPosition: correctPosition
        });
    }
}

function showTestQuestion() {
    if (currentTestIndex >= testQuestions.length) {
        showTestResults();
        return;
    }

    const question = testQuestions[currentTestIndex];
    const leftCard = question.correctPosition === 'left' ? question.correctCard : question.incorrectCard;
    const rightCard = question.correctPosition === 'right' ? question.correctCard : question.incorrectCard;

    document.getElementById('testCategory').textContent = currentCategory;
    document.getElementById('testQuestion').textContent = `Berühre ${question.german}`;
    document.getElementById('testProgress').textContent = `Question ${currentTestIndex + 1} of ${testQuestions.length}`;

    document.getElementById('leftImage').src = leftCard.image_url || leftCard.image_local;
    document.getElementById('rightImage').src = rightCard.image_url || rightCard.image_local;

    correctAnswer = question.correctPosition;
    answeredCorrectly = null;

    // Hide feedback
    document.getElementById('testFeedback').style.display = 'none';

    // Reset option styles
    document.getElementById('leftOption').classList.remove('correct', 'wrong');
    document.getElementById('rightOption').classList.remove('correct', 'wrong');

    // Show test layout, hide results
    document.querySelector('.test-layout').style.display = 'flex';
}

window.selectOption = function(option) {
    if (answeredCorrectly !== null) return; // Already answered

    const leftOption = document.getElementById('leftOption');
    const rightOption = document.getElementById('rightOption');
    const feedbackDiv = document.getElementById('testFeedback');
    const feedbackContent = document.getElementById('feedbackContent');

    if (option === correctAnswer) {
        // Correct answer
        answeredCorrectly = true;
        testScore++;
        document.getElementById('scoreValue').textContent = testScore;

        if (option === 'left') {
            leftOption.classList.add('correct');
        } else {
            rightOption.classList.add('correct');
        }

        feedbackContent.innerHTML = '<div class="feedback-correct">✓ Correct!</div>';
    } else {
        // Wrong answer
        answeredCorrectly = false;

        if (option === 'left') {
            leftOption.classList.add('wrong');
            rightOption.classList.add('correct');
        } else {
            rightOption.classList.add('wrong');
            leftOption.classList.add('correct');
        }

        feedbackContent.innerHTML = '<div class="feedback-wrong">✗ Wrong!</div>';
    }

    feedbackDiv.style.display = 'block';

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
        currentTestIndex++;
        showTestQuestion();
    }, 1500);
}

function showTestResults() {
    const percentage = Math.round((testScore / testQuestions.length) * 100);

    let emoji = '🎉';
    let message = 'Excellent!';

    if (percentage < 50) {
        emoji = '📚';
        message = 'Keep practicing!';
    } else if (percentage < 80) {
        emoji = '👍';
        message = 'Good job!';
    }

    // Update results screen
    document.getElementById('resultsEmoji').textContent = emoji;
    document.getElementById('resultsMessage').textContent = message;
    document.getElementById('resultsScoreText').textContent = `${testScore} / ${testQuestions.length} (${percentage}%)`;

    // Hide test screen, show results screen
    testScreen.style.display = 'none';
    resultsScreen.style.display = 'block';
}

window.backToCategories = function() {
    categoryScreen.style.display = 'block';
    modeScreen.style.display = 'none';
    learningScreen.style.display = 'none';
    testScreen.style.display = 'none';
    resultsScreen.style.display = 'none';

    currentCategory = null;
    selectedMode = null;
    flashcards = [];
    currentCategoryIndex = 0;
    highlightCategory(0);

    // Reset test screen for next time
    if (document.querySelector('.test-layout')) {
        document.querySelector('.test-layout').style.display = 'flex';
    }
}

window.retryTest = function() {
    // Restart the test with the same category
    resultsScreen.style.display = 'none';
    testScreen.style.display = 'block';

    // Generate new test questions
    generateTestQuestions();
    currentTestIndex = 0;
    testScore = 0;
    document.getElementById('scoreValue').textContent = testScore;
    document.getElementById('totalQuestions').textContent = testQuestions.length;

    showTestQuestion();
}

function updateCard() {
    if (flashcards.length === 0) return;

    const card = flashcards[currentCardIndex];
    const text = showingGerman ? card.german : card.english;
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

window.toggleHelp = function() {
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

    // Check current screen
    const onCategoryScreen = categoryScreen.style.display !== 'none';
    const onModeScreen = modeScreen.style.display !== 'none';
    const onLearningScreen = learningScreen.style.display !== 'none';
    const onTestScreen = testScreen.style.display !== 'none';
    const onResultsScreen = resultsScreen.style.display !== 'none';

    // ILoveYou - go back to categories (works everywhere except category screen)
    if (gestureName === 'ILoveYou') {
        if (!onCategoryScreen) {
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
    } else if (onModeScreen) {
        // Mode selection gestures
        switch (gestureName) {
            case 'Thumb_Up':
                showGesture('Test Mode', '👍');
                highlightMode(1);
                lastGesture = gestureName;
                lastGestureTime = now;
                setTimeout(() => {
                    selectMode('test');
                }, 500);
                break;

            case 'Thumb_Down':
                showGesture('Learn Mode', '👎');
                highlightMode(0);
                lastGesture = gestureName;
                lastGestureTime = now;
                setTimeout(() => {
                    selectMode('learn');
                }, 500);
                break;

            case 'Victory':
                showGesture('Toggle Help', '✌️');
                toggleHelp();
                lastGesture = gestureName;
                lastGestureTime = now;
                break;
        }
    } else if (onLearningScreen) {
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
    } else if (onResultsScreen) {
        // Results screen gestures
        switch (gestureName) {
            case 'Closed_Fist':
                showGesture('Try Again', '✊');
                retryTest();
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
    } else if (onTestScreen) {
        // Test screen - use pointing finger to detect which side user is pointing at
        if (answeredCorrectly === null) { // Only if not already answered
            // For Closed_Fist or Pointing_Up, check hand position
            if (gestureName === 'Pointing_Up') {
                // Get the index finger tip position (landmark 8)
                if (handLandmarks && handLandmarks.length > 8) {
                    const fingerTip = handLandmarks[8];

                    // Normalize coordinates (landmarks are 0-1, need to check which half of screen)
                    // fingerTip.x is 0-1, where 0.5 is center
                    if (fingerTip.x > 0.6) {
                        // Pointing at left side
                        showGesture('Select Left', '☝️');
                        selectOption('left');
                        lastGesture = gestureName;
                        lastGestureTime = now;
                    } else if (fingerTip.x < 0.4) {
                        // Pointing at right side
                        showGesture('Select Right', '☝️');
                        selectOption('right');
                        lastGesture = gestureName;
                        lastGestureTime = now;
                    }
                }
            } else if (gestureName === 'Victory') {
                showGesture('Toggle Help', '✌️');
                toggleHelp();
                lastGesture = gestureName;
                lastGestureTime = now;
            }
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

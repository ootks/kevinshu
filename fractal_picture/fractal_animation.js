// Canvas variables.
var mainCanvas = document.getElementById("animation");
var mainContext = mainCanvas.getContext('2d');

// Methods for starting/stopping animations.
var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame;

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

// Global variables for animation.
var DEPTH = 12;
var TRANSFORMS = 2;
var SIZE = TRANSFORMS ** DEPTH;
var COLORS = new Array(SIZE);
for (let i = 0; i < SIZE; i++) {
    COLORS[i] = HSVtoRGB(i / SIZE, 0.75, 0.8);
}

var DELTA_T = 0.1;

var points = new Array(SIZE);
var time = 0;

var matrices = [0,0];
var offsets = [0,0];

function increment_transforms() {
    TRANSFORMS += 1;
    SIZE = TRANSFORMS ** DEPTH;
    COLORS = new Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
        COLORS[i] = HSVtoRGB(i / SIZE, 0.75, 0.8);
    }
    points = new Array(SIZE);
}

// Utility functions
// Copied from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return "#" + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
}

function evaluateMatrix(matrix, time) {
    return matrix.map(x => (evaluateVector(x, time)));
}

function evaluateVector(vector, time) {
    return vector.map(x => x.evaluate({t:time}));
}

function getMatrix(index) {
    let matrix = [[0,0],[0,0]];
    for(let i = 1; i <= 2; i++) {
        for(let j = 1; j <= 2; j++) {
            matrix[i-1][j-1] = math.compile(
                document.getElementById("matrix"+String(index)+String(i)+String(j)).value);
        }
    }
    return matrix;
}

function drawCircle(x, y, r, color) {
    mainContext.beginPath();
    mainContext.arc(x, y, r, 0, Math.PI * 2, false);
    mainContext.closePath();

    // color in the circle
    mainContext.fillStyle = color;
    mainContext.fill();
}

function newPoints() {
    points[0] = [10,0];
    for(let iter = 0; iter < DEPTH; iter++) {
        var rounds = TRANSFORMS ** iter;
        for (let j = 0; j < rounds; j++) {
            for(let k = TRANSFORMS - 1;  k >= 0; k--) {
                points[k * rounds + j] =
                    math.add(
                        math.multiply(evaluateMatrix(matrices[k], time), points[j]),
                        evaluateVector(offsets[k], time));
            }
        }
    }
}

function updateFractal() {
    var canvasWidth = mainCanvas.width;
    var canvasHeight = mainCanvas.height;

    mainContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // color in the background
    mainContext.fillStyle = "#EEEEEE";
    mainContext.fillRect(0, 0, canvasWidth, canvasHeight);
    
    newPoints();

    var offset = [canvasWidth / 2, canvasHeight / 2];
    for(let i = 0; i < SIZE; i++) {
        offset[0] -= 3*points[i][0] / SIZE;
        offset[1] -= 3*points[i][1] / SIZE;
    }

    for(let i = 0; i < SIZE; i++) {
        drawCircle(3*points[i][0] + offset[0], 3*points[i][1] + offset[1], 1, COLORS[i]);
    }
}

function doAnimation() {
    updateFractal();
    time += DELTA_T;
    eventid = requestAnimationFrame(doAnimation);
}

function getVector(index) {
    let vector = [0,0]
    for(let i = 1; i <= 2; i++) {
        vector[i-1] = math.compile(
            document.getElementById("vector"+String(index)+String(i)).value);
    }
    return vector;
}

function startAnimation() {
    matrices = []
    offsets = []
    for (let i = 1; i <= TRANSFORMS; i++) {
        matrices.push(getMatrix(i));
        offsets.push(getVector(i));
    }
    time = 0;
    eventid = requestAnimationFrame(doAnimation);
}

function pauseAnimation() {
    cancelAnimationFrame(eventid);
}

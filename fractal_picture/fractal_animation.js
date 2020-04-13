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

// These values are only used when we go to randomized point selection.
var colors;
var indices;

// This value is only used when something has focus.
var focusedElement;

// True if there is an error in parsing the matrices
var parseError = false;

function incrementTransforms() {
    TRANSFORMS += 1;
    DEPTH -= 2;
    SIZE = 2 * SIZE;
    COLORS = new Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
        COLORS[i] = HSVtoRGB(i / SIZE, 0.75, 0.8);
    }
    points = new Array(SIZE);
    colors = new Array(SIZE);
    indices = new Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
        indices[i] = i;
    }
    for (let i = 0; i < SIZE; i++) {
        points[i] = [0,0];
    }
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
    let evaluatedMatrix = [[0,0],[0,0]];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            try {
                evaluatedMatrix[i][j] = matrix[i][j].evaluate({t:time})
            } catch(err) {
                console.log(err);
                throw String(i+1)+", "+String(j+1);
            }
        }
    }
    return evaluatedMatrix;
}

function evaluateVector(vector, time) {
    let evaluatedVector = [0,0];
    for (let i = 0; i < 2; i++) {
        try {
            evaluatedVector[i] = vector[i].evaluate({t:time})
        } catch(err) {
            console.log(err);
            throw String(i + 1)
        }
    }
    return evaluatedVector;
}

function getMatrix(index) {
    let matrix = [[0,0],[0,0]];
    for(let i = 1; i <= 2; i++) {
        for(let j = 1; j <= 2; j++) {
                matrix[i-1][j-1] = math.compile(
                    document.getElementById(
                        "matrix"+String(index)+String(i)+String(j)).value);
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

function evaluateTransforms() {
    let evaluatedMatrices = new Array(TRANSFORMS);
    for (let i = 0; i < TRANSFORMS; i++) {
        try {
            evaluatedMatrices[i] = evaluateMatrix(matrices[i], time);
        } catch(err) {
            parseError = true;
            throw "Function " + String(i+1) + " has an error in matrix position "+err;
        }
    }

    let evaluatedOffsets = new Array(TRANSFORMS);
    for (let i = 0; i < TRANSFORMS; i++) {
        try {
            evaluatedOffsets[i] = evaluateVector(offsets[i], time);
        } catch(err) {
            parseError = true;
            throw "Function " + String(i+1) + " has an error in vector position "+err;
        }
    }

    parseError = false;
    return [evaluatedMatrices, evaluatedOffsets]
}



function randomNewPoints() {
    var evaluatedMatrices, evaluatedOffsets;
    [evaluatedMatrices, evaluatedOffsets] = evaluateTransforms();

    for (let i = 0; i < SIZE; i++) {
        indices[i]
    }
    for(let i = 0; i < SIZE; i++) {
        let point = points[i];
        colors[i] = 0;
        for(let iter = 0; iter < DEPTH; iter++) {
            let index = Math.floor(Math.random() * TRANSFORMS);
            colors[i] /= TRANSFORMS;
            colors[i] += index;
            point = math.add(math.multiply(evaluatedMatrices[index], point), evaluatedOffsets[index]);
        }
        points[i] = point;
    }
    indices.sort((i, j) => colors[i] - colors[j]);
    for(let i = 0; i < SIZE; i++) {
        colors[i] = points[indices[i]];
    }
    temp = points;
    points = colors;
    colors = temp;
    for(let i = 0; i < SIZE; i++) {
        indices[i] = i;
    }
}

function errorMessage(error) {
    mainContext.font = '30px serif';
    mainContext.fillStyle = "#AA0000";
    mainContext.fillText(error, 150, 100);
}

function newPoints() {
    var evaluatedMatrices, evaluatedOffsets;
    [evaluatedMatrices, evaluatedOffsets] = evaluateTransforms();

    points[0] = [10,0];

    for(let iter = 0; iter < DEPTH; iter++) {
        var rounds = TRANSFORMS ** iter;
        for (let j = 0; j < rounds; j++) {
            for(let k = TRANSFORMS - 1;  k >= 0; k--) {
                points[k * rounds + j] =
                    math.add(
                        math.multiply(evaluatedMatrices[k], points[j]),
                        evaluatedOffsets[k], time);
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
    
    try {
        if (TRANSFORMS == 2) {
            newPoints();
        } else {
            randomNewPoints();
        }
    } catch(err) {
        console.log(err);
        errorMessage(err);
        return;
    }
 
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
    if (time > 1000000) {
        time = 0;
    }
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
    console.log("Starting Animation.");
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

function newControl(index) {
    return `<div class = "control" onfocusin="pauseAnimation(); fullScreen(this);" onfocusout="startAnimation(); unFullScreen(this);"> <span class="function_symbol"> \\(f_${index}(x) =\\) </span> <span><span class="left_bracket"> \\(\\Big(\\) </span> <form class="matrix_form"  onsubmit='document.activeElement.blur(); return false'> <input type="submit" style="display: none" /> <input type="text" size="5" value="1"  id="matrix${index}11"> <input type="text" size="5" value="0" id="matrix${index}12"> <input type="text" size="5" value="0"  id="matrix${index}21"> <input type="text" size="5" value="1"  id="matrix${index}22"> </form> <span class="right_bracket"></span> \\(\\Big)\\) </span> <span class="plus_sign"> \\(x\\) + </span> <span><span class="left_bracket"> \\(\\Big(\\) </span> <form class="vector_form" onsubmit='document.activeElement.blur(); return false'> <input type="submit" style="display: none" /> <input type="text" size="5" value="10" id="vector${index}1"> <input type="text" size="5" value="0"  id="vector${index}2"> </form> <span class="right_bracket"> \\(\\Big)\\) </span></span> </div>`;
}

function addTransforms() {
    pauseAnimation();

    incrementTransforms();

    var new_control = document.createElement('div');
    new_control.innerHTML = newControl(TRANSFORMS);
    var add_button = document.getElementById("add_control");
    var container = document.getElementById("control_container");
    container.insertBefore(new_control, add_button); 
    MathJax.typeset();
}

function fullScreen(element) {
    element.classList.add("fullscreen");
    focusedElement = element;
}

function unFullScreen(element) {
    element.classList.remove("fullscreen");
    focusedElement = undefined;
}

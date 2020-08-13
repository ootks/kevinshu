// Collapses the navbar when clicked.
var collapsed = true;
var was_collapsed = false;
function toggleCollapse() {
    if (collapsed) {
        document.getElementById("homeSidebar").style.display = "block";
        collapsed = false;
    } else {
        document.getElementById("homeSidebar").style.display = "none";
        collapsed = true;
    }
}

function redisplay() {
    if (!window.matchMedia("(max-width: 800px").matches) {
        document.getElementById("homeSidebar").style.display = "block";
    } else {
        document.getElementById("homeSidebar").style.display = "none";
    }
}

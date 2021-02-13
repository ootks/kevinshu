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

// The issue is that if the thing is collapsed, and then you resize until it is in full screen mode size, then there'll just be no header.
function redisplay() {
    if (!window.matchMedia("(max-width: 800px").matches) {
            document.getElementById("homeSidebar").style.display = "block";
    } else {
        if (collapsed) {
            document.getElementById("homeSidebar").style.display = "none";
        }
    }
}

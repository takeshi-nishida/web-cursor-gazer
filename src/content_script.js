console.log("running webgazer-chrome-extension...");

webgazer.setGazeListener((data, time) => {
    if(!data) return;

    console.log("(" + data.x + "," + data.y + ") @" + time);
});

//webgazer.begin();

const spotlight = document.createElement("div");
spotlight.classList.add("extension-spotlight");
document.body.appendChild(spotlight);

chrome.storage.local.get({
    spotlightSize: 200,
}, (data) => {

    document.addEventListener("mousemove", e => {
        const background = `background: radial-gradient(
            circle at ${e.clientX}px ${e.clientY}px,
            transparent,
            transparent ${data.spotlightSize}px,
            rgba(0, 0, 0, 0.6) ${data.spotlightSize * 2}px)`
        spotlight.setAttribute("style", background);
    });

})




console.log("running webgazer-chrome-extension...");

// webgazer.setGazeListener((data, time) => {
//     if(!data) return;

//     console.log("(" + data.x + "," + data.y + ") @" + time);
// });

//webgazer.begin();

const spotlight = document.createElement("div");
spotlight.classList.add("extension-spotlight");
document.body.appendChild(spotlight);

chrome.storage.local.get({
    spotlightSize: 200,
}, (data) => {
    document.addEventListener("mousemove", e => {
        spotlight.setAttribute("style", createSpotlight(e.clientX, e.clientY, data.spotlightSize));
    });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(!sender.tab){ // message was from popup.js
        switch(request.type){
            case "start recording": startRecording() ; break;
            case "stop recording": stopRecording() ; break;
            case "replay": replay() ; break;
            case "log": break;
        }
        sendResponse(cursorLog);
    }
});

let cursorLog;

function recordMouse(e){
    cursorLog.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
}

function startRecording(){
    console.log("start recording");
    cursorLog = [];
    document.addEventListener("mousemove", recordMouse);
}

function stopRecording(){
    console.log("stop recording");
    document.removeEventListener("mousemove", recordMouse);
}

function replay(){
    console.log("replay");

    let i = 0;

    replayImpl = () => {
        if(i < cursorLog.length){
            const e = cursorLog[i];
            spotlight.setAttribute("style", createSpotlight(e.x, e.y, 200));
            if(i + 1 < cursorLog.length){
                const next = cursorLog[++i];
                setTimeout(replayImpl, next.t - e.t);
            }
        }
    };

    replayImpl();
}

function createSpotlight(x, y, size){
    return `background: radial-gradient(
        circle at ${x}px ${y}px,
        transparent,
        transparent ${size}px,
        rgba(0, 0, 0, 0.6) ${size * 2}px)`
}

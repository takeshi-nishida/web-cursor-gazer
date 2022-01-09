console.log("running webgazer-chrome-extension...");

// webgazer.setGazeListener((data, time) => {
//     if(!data) return;

//     console.log("(" + data.x + "," + data.y + ") @" + time);
// });

//webgazer.begin();

let useSpotlight = false;
let useBlur = false;

const spotlight = document.createElement("div");
spotlight.classList.add("extension-spotlight");
document.body.appendChild(spotlight);

let lastMouseEvent = null;
let ticking = false;

chrome.storage.local.get({
    spotlightSize: 200,
}, (data) => {
    document.addEventListener("mousemove", e => {
        lastMouseEvent = e;

        if(!ticking){
            window.requestAnimationFrame(() => {
                if(useSpotlight){
                    spotlight.setAttribute("style", createSpotlight(e.clientX, e.clientY, data.spotlightSize));
                }
        
                if(useBlur){
                    const hit = buildHitFunction(e.clientX, e.clientY, data.spotlightSize);
                    recursiveCheckAndApply(document.body, hit, blurNode);
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    document.addEventListener('scroll', e => {
        if(!ticking){
            window.requestAnimationFrame(() => {
                if(useBlur && lastMouseEvent){
                    const hit = buildHitFunction(lastMouseEvent.clientX, lastMouseEvent.clientY, data.spotlightSize);
                    recursiveCheckAndApply(document.body, hit, blurNode);
                }
                ticking = false;    
            });
            ticking = true;
        }
    });
});

function buildHitFunction(x, y, r){
    return (n) => {
        const rect = n.getBoundingClientRect();
        const distX = Math.abs(x - rect.x - rect.width / 2);
        const distY = Math.abs(y - rect.y - rect.height / 2);
    
        if (distX > (rect.width / 2 + r)) { return false; }
        if (distY > (rect.height / 2 + r)) { return false; }
    
        if (distX <= rect.width / 2) { return true; } 
        if (distY <= rect.height / 2) { return true; }
    
        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return dx * dx + dy * dy <= r * r;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("message received: " + request.type);
    if(!sender.tab){ // message was from popup.js
        switch(request.type){
            case "start recording": startRecording() ; break;
            case "stop recording": stopRecording() ; break;
            case "replay": replay() ; break;
            case "log": break;
            case "load-csv": loadCSV(); break;
            case "toggle-spotlight": toggleSpotlight(); break;
            case "toggle-blur": toggleBlur(); break;
        }
        sendResponse(cursorLog);
    }
});

let cursorLog;

function record(e){
    const scrollLeft = document.documentElement.scrollLeft;
    const scrollTop = document.documentElement.scrollTop;
    const x = e.clientX, y = e.clientY, t = e.timeStamp;
    cursorLog.push({ x, y, t, scrollTop, scrollLeft });
}

function recordMouseMove(e){ record(e); }
function recordScroll(e){ if(lastMouseEvent) record(lastMouseEvent); }

function startRecording(){
    console.log("start recording");
    cursorLog = [];
    document.addEventListener("mousemove", recordMouseMove);
    document.addEventListener("scroll", recordScroll);
}

function stopRecording(){
    console.log("stop recording");
    document.removeEventListener("mousemove", recordMouseMove);
    document.removeEventListener("scroll", recordScroll);
}

function replay(){
    console.log("replay");

    recursiveCheckAndApply(document.body, () => true, blurNode);

    chrome.storage.local.get({
        spotlightSize: 200,
    }, (data) => {
        let i = 0;

        replayImpl = () => {
            if(i < cursorLog.length){
                const e = cursorLog[i];
                spotlight.setAttribute("style", createSpotlight(e.x, e.y, data.spotlightSize));
                document.documentElement.scrollTo(e.scrollLeft, e.scrollTop);
                if(i + 1 < cursorLog.length){
                    const next = cursorLog[++i];
                    setTimeout(replayImpl, next.t - e.t);
                }
            }
        };

        replayImpl();
    });
}

function createSpotlight(x, y, size){
    return `background: radial-gradient(
        circle at ${x}px ${y}px,
        transparent,
        transparent ${size}px,
        rgba(0, 0, 0, 0.6) ${size * 2}px)`
}

function recursiveCheckAndApply(n, hit, f){
    if(n.children.length == 0){
        f(n, hit);
        return;
    }
    
    const cs = n.children;
    for(let i = 0; i < cs.length; i++){
        recursiveCheckAndApply(cs[i], hit, f);
    }
}

function blurNode(n, hit){
    if(!hit(n)){
        n.classList.add("extension-blur");
    }
    else{
        n.classList.remove("extension-blur");
    }
}

function toggleSpotlight(){
    useSpotlight = !useSpotlight;
    spotlight.style.visibility = useSpotlight ? "visible" : "hidden";
}

function toggleBlur(){
    useBlur = !useBlur;
    recursiveCheckAndApply(document.body, () => !useBlur, blurNode);
}

const showOpenFileDialog = () => {
    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = event => { resolve(event.target.files[0]); };
        input.click();
    });
};

const readAsText = file => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => { resolve(reader.result); };
    });
};

async function loadCSV(){
    const file = await showOpenFileDialog();
    const content = await readAsText(file);

    const lines = content.split("\n");
    const header = lines.shift().split(",");

    console.log(lines);

    cursorLog = [];

    lines.map(line => {
        const a = line.split(",");
        const o = {};
        header.forEach((h, i) => { o[h] = a[i] });
        cursorLog.push(o);
    });

    console.log(cursorLog);
    console.log("CSV loaded.");
}

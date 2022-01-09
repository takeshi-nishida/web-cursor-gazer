const startRecordingButton = document.getElementById("startRecording");
const stopRecordingButton = document.getElementById("stopRecording");
const replayButton = document.getElementById("replay");
const csvButton = document.getElementById("prepareCSV");
const csvLink = document.getElementById("csv");
const loadCSVButton = document.getElementById("loadCSV");

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
replayButton.addEventListener("click", replay);
prepareCSV.addEventListener("click", requestLog);
loadCSVButton.addEventListener("click", loadCSV)

async function startRecording(){
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, { type: "start recording" }, res => console.log(res));
}

async function stopRecording(){
    const tab = await getCurrentTab();    
    chrome.tabs.sendMessage(tab.id, { type: "stop recording" }, res => console.log(res));
}

async function replay(){
    const tab = await getCurrentTab();    
    chrome.tabs.sendMessage(tab.id, { type: "replay" }, res => console.log(res));
}

async function requestLog(){
    const tab = await getCurrentTab();    
    chrome.tabs.sendMessage(tab.id, { type: "log" }, res => csv(res));
}

async function loadCSV(){
    const tab = await getCurrentTab();    
    chrome.tabs.sendMessage(tab.id, { type: "load-csv" }, res => console.log(res));
}

async function getCurrentTab(){
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function csv(data) {
    const content = object2csv(data);
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { "type": "text/csv" });
    csvLink.href = window.URL.createObjectURL(blob);
    csvLink.style.visibility = "visible";
}

function object2csv(json) {
    var header = Object.keys(json[0]).join(',') + "\n";

    var body = json.map(function(d){
        return Object.keys(d).map(function(key) {
            return d[key];
        }).join(',');
    }).join("\n");

    return header + body;
}
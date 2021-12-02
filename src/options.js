const inputSpotlightSize = document.getElementById("spotlight-size");
const saveButton = document.getElementById("save-button");
const stat = document.getElementById("status");

function saveOptions(){
    chrome.storage.local.set({
        spotlightSize: inputSpotlightSize.value
    }, () => {
        stat.textContent = "Options saved."
        setTimeout(() => stat.textContent = "", 1000);
    });
}

function loadOptions(){
    console.log("loadOptions");

    chrome.storage.local.get({
        spotlightSize: 200
    }, (data) => {
        inputSpotlightSize.value = data.spotlightSize;
    })
}

saveButton.addEventListener("click", saveOptions);
document.addEventListener("DOMContentLoaded", loadOptions);

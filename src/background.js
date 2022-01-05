chrome.commands.onCommand.addListener(sendCommand);

async function sendCommand(command){
    const tab = await getCurrentTab();    
    chrome.tabs.sendMessage(tab.id, { type: command }, res => console.log(res));
}

async function getCurrentTab(){
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
    return tab;
}

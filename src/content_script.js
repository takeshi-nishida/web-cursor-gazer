console.log("running webgazer-chrome-extension...");

webgazer.setGazeListener((data, time) => {
    if(!data) return;

    console.log("(" + data.x + "," + data.y + ") @" + time);
});

webgazer.begin();
import WeDo from "node-wedo";
import ControlLab from "node-controllab";
import express from "express";

import WeDoMotionSensor from "./wedomotionsensor";
// import WeDoTrain from "./wedotrain";
import ControlLabTrain from "./controllabtrain";

const weDo = new WeDo();
const controlLab = new ControlLab("/dev/ttyUSB0");
const app = express();

const delay = (milliseconds = 500) => new Promise((resolve) => setTimeout(resolve, milliseconds));

enum State {
    LOOPING = 0,
    SLOWING = 1,
    PAUSED = 2,
    STOPPED = 3,
    STARTING = 4
}

let state = State.STOPPED;
let loop = 0;
let wantStop = true;

(async () => {

    console.log("Waiting for WeDo");
    await weDo.connect();
    console.log("WeDo connected");

    console.log("Waiting for Control Lab");
    await controlLab.connect();
    console.log("Connected to Control Lab");

    const stationSensor = new WeDoMotionSensor(weDo, "StationSensor", "B", 180);
    // const christmasTrain = new WeDoTrain(weDo, "ChristmasTrain", "A");
    const christmasTrain = new ControlLabTrain(controlLab, "ChristmasTrain", "A");

    const stopTrain = async () => {
        console.log("Slowing Christmas Train");
        state = State.SLOWING;
        for (let i = 4; i >= 0; i--) {
            christmasTrain.go(i);
            await delay(500);
        }
        state = State.PAUSED;
        console.log("Paused Christmas Train");
    };

    const startTrain = async () => {
        console.log("Starting Christmas Train");
        state = State.STARTING;
        loop = 0;
        for (let i = 1; i <= 5; i++) {
            christmasTrain.go(i);
            await delay(500);
        }
        state = State.LOOPING;
    };

    stationSensor.on("detected", async (sensorState: number) => {
        console.log(`Sensor ${sensorState}`);
        if (sensorState === 0) {
            if (state === State.LOOPING && loop >= 2) {
                await delay(400);
                await stopTrain();
                await delay(10000);
                if (wantStop) {
                    state = State.STOPPED;
                    console.log("Stopped Christmas Train");
                    return;
                } else {
                    await startTrain();
                }
            } else if (state === State.LOOPING) {
                console.log(`Loop ${loop}`);
                loop++;
            }
        }
    });

    app.get("/christmastrain/stop", (_, res) => {
        console.log("Received Christmas Train stop request");
        wantStop = true;
        loop = 2;
        res.send("ok");
    });
    
    app.get("/christmastrain/start", (_, res) => {
        console.log("Received Christmas Train start request");
        wantStop = false;
        if (state === State.STOPPED) {
            startTrain();
        }
        res.send("ok");
    });

    app.get("/christmastrain/status", (_, res) => {
        res.send(String(wantStop ? 0 : 1));
    });

    app.use((_, res, next) => {
        res.set("Cache-Control", "no-store");
        next()
    });

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Christmas Train listening on port ${port}`);
    });

})();
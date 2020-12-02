import WeDo from "node-wedo";

import WeDoMotionSensor from "./wedomotionsensor";
import WeDoTrain from "./wedotrain";
const weDo = new WeDo();

const delay = (milliseconds = 500) => new Promise((resolve) => setTimeout(resolve, milliseconds));

enum State {
    LOOPING = 0,
    STOPPING = 1,
    STOPPED = 2,
    STARTING = 3
}

let state = State.STOPPED;
let loop = 0;

(async () => {

    console.log("Waiting for WeDo");
    await weDo.connect();
    console.log("WeDo connected");

    const stationSensor = new WeDoMotionSensor(weDo, "StationSensor", "B");
    const christmasTrain = new WeDoTrain(weDo, "ChristmasTrain", "A");

    const stopTrain = async () => {
        state = State.STOPPING;
        for (let i = 7; i >= 0; i--) {
            christmasTrain.go(i);
            await delay(500);
        }
        state = State.STOPPED;
    };

    const startTrain = async () => {
        state = State.STARTING;
        for (let i = 1; i <= 8; i++) {
            christmasTrain.go(i);
            await delay(500);
        }
        state = State.LOOPING;
        loop = 0;
    };

    await delay(2000);
    console.log("Starting Christmas Train");
    await startTrain();

    stationSensor.on("detected", async (sensorState: number) => {
        console.log(`Sensor ${sensorState}`);
        if (sensorState === 0) {
            if (state === State.LOOPING && loop === 2) {
                console.log("Stopping Christmas Train");
                await stopTrain();
                await delay(10000);
                console.log("Starting Christmas Train");
                await startTrain();
            } else if (state === State.LOOPING) {
                console.log(`Loop ${loop}`);
                loop++;
            }
        }
    });

})();
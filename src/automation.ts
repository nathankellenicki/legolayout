import PoweredUP, { Consts } from "node-poweredup";
import ControlLab from "node-controllab";
import WeDo from "node-wedo";

import ControlLabSignal from "./controllabsignal";
import ControlLabSwitch from "./controllabswitch";
import PoweredUPTrain from "./powereduptrain";
import ControlLabTrain from "./controllabtrain";
import WeDoMotionSensor from "./wedomotionsensor";

const poweredUP = new PoweredUP();
const controlLab = new ControlLab("/dev/tty.usbserial-AC018HBC");
const farWeDo = new WeDo("39cd6ce026e4c95b64e03796f61f214e27d7de11");
const nearWeDo = new WeDo("45da83eabc4c523082430b35207f9d3774e1957e");

const delay = (milliseconds = 500) => new Promise((resolve) => setTimeout(resolve, milliseconds));

let count = 0;

(async () => {

    console.log("Waiting for Control Lab");
    await controlLab.connect();
    console.log("Connected to Control Lab");
    // console.log(WeDo.discover());
    // process.exit(0);
    console.log("Waiting for Far WeDo");
    await farWeDo.connect();
    console.log("Connected to Far WeDo");
    console.log("Waiting for Near WeDo");
    await nearWeDo.connect();
    console.log("Connected to Near WeDo");

    const mainEntrySensor = new WeDoMotionSensor(farWeDo, "MainEntrySensor", "B");
    const mainExitSensor = new WeDoMotionSensor(nearWeDo, "MainExitSensor", "B");
    const passingEntrySensor = new WeDoMotionSensor(nearWeDo, "PassingEntrySensor", "A");
    const passingExitSensor = new WeDoMotionSensor(farWeDo, "PassingExitSensor", "A");

    const mainSignal = new ControlLabSignal(controlLab, "MainSignal", "A", "B");
    const passingSignal = new ControlLabSignal(controlLab, "PassingSignal", "C", "D");

    const farSwitch = new ControlLabSwitch(controlLab, "FarSwitch", "E");
    const nearSwitch = new ControlLabSwitch(controlLab, "NearSwitch", "F");

    const metrolinerTrain = new ControlLabTrain(controlLab, "MetrolinerTrain", "H");
    const crocodileTrain = new PoweredUPTrain(poweredUP, "CrocodileTrain", "NK_Crocodile1", "A", Consts.Color.BLUE);

    console.log("Begin Powered UP scanning");
    poweredUP.scan();

    const metrolinerGo = async () => {
        farSwitch.left();
        nearSwitch.left();

        console.log("Starting Metroliner");

        await delay(2000);
        mainSignal.green();
        await delay(2000);
        metrolinerTrain.go(3);
        await delay(700);
        metrolinerTrain.go(4);
        await delay(700);
        metrolinerTrain.go(5);
        await delay(700);
        metrolinerTrain.go(6);
        await delay(700);
        metrolinerTrain.go(7);
        await delay(700);
        metrolinerTrain.go(8);

        await delay(2000);
        let isActive = true;
        mainEntrySensor.on("detected", async (state: number) => {
            if (state === 0 && isActive) {
                if (count < 2) {
                    count++;
                    console.log("Loop", count);
                    if (count == 2) {
                        await delay(5000);
                        mainSignal.red();
                    }
                    return;
                }
                isActive = false;
                mainEntrySensor.removeAllListeners();
                count = 0;
                console.log("Stopping Metroliner");
                metrolinerTrain.go(7);
                await delay(400);
                metrolinerTrain.go(6);
                await delay(400);
                metrolinerTrain.go(5);
                await delay(400);
                metrolinerTrain.go(4);
                await delay(400);
                metrolinerTrain.go(3);
                mainExitSensor.on("detected", async (state: number) => {
                    if (state === 0) {
                        mainExitSensor.removeAllListeners();
                        metrolinerTrain.stop();
                        await delay(2000);
                        crocodileGo();
                    }
                });
            }
        });
    }

    const crocodileGo = async () => {
        farSwitch.right();
        nearSwitch.right();

        console.log("Starting Crocodile");

        await delay(2000);
        passingSignal.green();
        await delay(2000);
        crocodileTrain.go(-2);
        await delay(1000);
        crocodileTrain.go(-3);
        await delay(1000);
        crocodileTrain.go(-4);
        await delay(1000);
        crocodileTrain.go(-5);
        await delay(1000);
        crocodileTrain.go(-6);
        await delay(1000);
        crocodileTrain.go(-7);
        await delay(1000);
        crocodileTrain.go(-8);

        await delay(2000);
        let isActive = true;
        passingEntrySensor.on("detected", async (state: number) => {
            if (state === 0 && isActive) {
                if (count < 2) {
                    count++;
                    console.log("Loop", count);
                    if (count == 2) {
                        await delay(9000);
                        passingSignal.red();
                    }
                    return;
                }
                isActive = false;
                passingEntrySensor.removeAllListeners();
                count = 0;
                console.log("Stopping Crocodile");
                crocodileTrain.go(-7);
                await delay(1000);
                crocodileTrain.go(-6);
                await delay(1000);
                crocodileTrain.go(-5);
                await delay(1000);
                crocodileTrain.go(-4);
                await delay(1000);
                crocodileTrain.go(-3);
                passingExitSensor.on("detected", async (state: number) => {
                    if (state === 0) {
                        passingExitSensor.removeAllListeners();
                        crocodileTrain.stop();
                        await delay(2000);
                        metrolinerGo();
                    }
                });
            }
        });
    }

    await delay(10000);
    console.log("Starting automation");
    metrolinerGo();

})();
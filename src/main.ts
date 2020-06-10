import PoweredUP, { Consts, BaseHub, RemoteControl, HubLED, RemoteControlButton, Hub, ColorDistanceSensor } from "node-poweredup";
import ControlLab from "node-controllab";
import ControlLabSignal from "./controllabsignal";
import Signal from "./signal";
import ControlLabSwitch from "./controllabswitch";
import PoweredUPTrain from "./powereduptrain";
import ControlLabTrain from "./controllabtrain";
import Train from "./train";

const poweredUP = new PoweredUP();
const controlLab = new ControlLab("/dev/tty.usbserial-AC018HBC");

(async () => {

    console.log("Waiting for Control Lab");
    await controlLab.connect();
    console.log("Connected to Control Lab");

    const mainSignal = new ControlLabSignal(controlLab, "MainSignal", "C", "D");
    const passingSignal = new ControlLabSignal(controlLab, "PassingSignal", "A", "B");
    const mainSwitch = new ControlLabSwitch(controlLab, "MainSwitch", "E");

    let maerskTrain: PoweredUPTrain | undefined;
    const metrolinerTrain = new ControlLabTrain(controlLab, "MetrolinerTrain", "H");

    let activeTrain: Train = metrolinerTrain;

    poweredUP.on("discover", async (hub: BaseHub) => {
        if (hub instanceof RemoteControl) {
            const remote = hub;

            await remote.connect();
            console.log(`Connected to Powered UP remote`);
            const led = await remote.waitForDeviceByType(Consts.DeviceType.HUB_LED) as HubLED;
            led.setColor(Consts.Color.WHITE);
            const left = await remote.waitForDeviceAtPort("LEFT") as RemoteControlButton;
            const right = await remote.waitForDeviceAtPort("RIGHT") as RemoteControlButton;

            left.on("remoteButton", ({ event }) => {
                if (event === Consts.ButtonState.UP) {
                    activeTrain.increase();
                } else if (event === Consts.ButtonState.DOWN) {
                    activeTrain.decrease();
                } else if (event === Consts.ButtonState.STOP) {
                    activeTrain.stop();
                }
            });

            right.on("remoteButton", ({ event }) => {
                if (event === Consts.ButtonState.DOWN) {
                    mainSignal.toggle();
                } else if (event === Consts.ButtonState.UP) {
                    passingSignal.toggle();
                } else if (event === Consts.ButtonState.STOP) {
                    mainSwitch.toggle();
                }
            });

            hub.on("button", ({ event }) => {
                if (event === Consts.ButtonState.PRESSED) {
                    if (activeTrain === metrolinerTrain && maerskTrain) {
                        activeTrain = maerskTrain;
                        led.setColor(Consts.Color.LIGHT_BLUE);
                    } else if (activeTrain === maerskTrain) {
                        activeTrain = metrolinerTrain;
                        led.setColor(Consts.Color.WHITE);
                    }
                }
            })

        } else if (hub instanceof Hub) {
            const train = hub;

            await train.connect();
            maerskTrain = new PoweredUPTrain(train, "MaerskTrain", "A");
            const led = await train.waitForDeviceByType(Consts.DeviceType.HUB_LED) as HubLED;
            const sensor = await train.waitForDeviceByType(Consts.DeviceType.COLOR_DISTANCE_SENSOR) as ColorDistanceSensor;
            led.setColor(Consts.Color.WHITE);
            console.log("Connected to Maersk train");

            sensor.on("color", ({ color }) => {
                if (color === Consts.Color.RED && mainSignal.isRed) {
                    maerskTrain?.stop();
                }
            })

            train.on("disconnect", () => {
                maerskTrain = undefined;
                activeTrain = metrolinerTrain;
            });

        }
    });

    poweredUP.scan();

})();
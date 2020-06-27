import PoweredUP, { Consts } from "node-poweredup";
import ControlLab from "node-controllab";
import ControlLabSignal from "./controllabsignal";
import ControlLabSwitch from "./controllabswitch";
import PoweredUPTrain from "./powereduptrain";
import ControlLabTrain from "./controllabtrain";
import PoweredUPTrainRemote from "./powereduptrainremote";

const poweredUP = new PoweredUP();
const controlLab = new ControlLab("/dev/ttyUSB0");

(async () => {

    console.log("Waiting for Control Lab");
    await controlLab.connect();
    console.log("Connected to Control Lab");

    const mainSignal = new ControlLabSignal(controlLab, "MainSignal", "A", "B");
    const passingSignal = new ControlLabSignal(controlLab, "PassingSignal", "C", "D");

    const entrySwitch = new ControlLabSwitch(controlLab, "EntrySwitch", "E");
    const exitSwitch = new ControlLabSwitch(controlLab, "ExitSwitch", "F");

    const metrolinerTrain = new ControlLabTrain(controlLab, "MetrolinerTrain", "H");
    const crocodileTrain = new PoweredUPTrain(poweredUP, "CrocodileTrain", "NK_Crocodile1", "A", Consts.Color.YELLOW);

    const remote = new PoweredUPTrainRemote(poweredUP, "Remote", "NK_Remote1", [metrolinerTrain, crocodileTrain]);

    console.log("Begin Powered UP scanning");
    poweredUP.scan();

})();
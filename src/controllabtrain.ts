import ControlLab from "node-controllab";

import Train from "./train";

export default class ControlLabTrain extends Train {

    public port: string;

    private _controlLab: ControlLab;

    constructor (controlLab: ControlLab, name: string, port: string) {
        super(name);
        this._controlLab = controlLab;
        this.port = port;
    }

    public go (speed: number) {
        super.go(speed);
        this._controlLab.setPower(this.port, speed);
    }

    public stop () {
        this.go(0);
    }

}
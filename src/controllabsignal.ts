import ControlLab from "node-controllab";

import Signal from "./signal";

export default class ControlLabSignal extends Signal {

    public greenPort: string;
    public redPort: string;

    private _controlLab: ControlLab;

    constructor (controlLab: ControlLab, name: string, redPort: string, greenPort: string) {
        super(name);
        this._controlLab = controlLab;
        this.redPort = redPort;
        this.greenPort = greenPort;
        this.red();
    }

    public green () {
        super.green();
        this._controlLab.setPower(this.redPort, 0);
        this._controlLab.setPower(this.greenPort, 8);
    }

    public red () {
        super.red();
        this._controlLab.setPower(this.redPort, 8);
        this._controlLab.setPower(this.greenPort, 0);
    }

}
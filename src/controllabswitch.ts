import ControlLab from "node-controllab";

import Switch from "./switch";

export default class ControlLabSwitch extends Switch {

    public port: string;

    private _controlLab: ControlLab;

    constructor (controlLab: ControlLab, name: string, port: string) {
        super(name);
        this._controlLab = controlLab;
        this.port = port;
        this.left();
    }

    public async left () {
        await super.left();
        this._controlLab.setPower(this.port, -8);
        await this._controlLab.sleep(200);
        this._controlLab.setPower(this.port, 0);
    }

    public async right () {
        await super.right();
        this._controlLab.setPower(this.port, 8);
        await this._controlLab.sleep(200);
        this._controlLab.setPower(this.port, 0);
    }

}
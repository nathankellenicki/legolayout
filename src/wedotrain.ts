import WeDo from "node-wedo";

import Train from "./train";

export default class WeDoTrain extends Train {

    public port: string;

    private _weDo: WeDo;

    constructor (weDo: WeDo, name: string, port: string) {
        super(name);
        this._weDo = weDo;
        this.port = port;
    }

    public go (speed: number) {
        speed = Math.round(12.5 * speed);
        super.go(speed);
        this._weDo.setPower(this.port, speed);
    }

    public stop () {
        this.go(0);
    }

}
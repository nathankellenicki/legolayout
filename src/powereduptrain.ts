import { BaseHub, Hub, TrainMotor } from "node-poweredup";

import Train from "./train";

export default class PoweredUPTrain extends Train {

    public port: string;

    private _hub: BaseHub;
    private _reverse: boolean;

    constructor (hub: BaseHub, name: string, port: string, reverse: boolean = false) {
        super(name);
        this._hub = hub;
        this.port = port;
        this._reverse = reverse;

    }

    public async go (speed: number) {
        super.go(speed);
        const motor = await this._hub.waitForDeviceAtPort(this.port) as any;
        speed = Math.round(12.5 * speed);
        speed = this._reverse ? -speed : speed;
        motor.setPower(speed);
    }

    public stop () {
        this.go(0);
    }

}
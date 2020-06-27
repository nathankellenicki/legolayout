import PoweredUP, { BaseHub, Consts, HubLED } from "node-poweredup";

import Train from "./train";

export default class PoweredUPTrain extends Train {

    public port: string;

    private _hub: BaseHub | undefined;
    private _poweredUp: PoweredUP;
    private _hubName: string;
    private _name: string;
    private _color: Consts.Color;
    private _reverse: boolean;

    constructor (poweredUp: PoweredUP, name: string, hubName: string, hubPort: string, color: Consts.Color, reverse: boolean = false) {
        super(name);
        this._poweredUp = poweredUp;
        this._hubName = hubName;
        this._name = name;
        this._color = color;
        this.port = hubPort;
        this._reverse = reverse;
        poweredUp.on("discover", async (hub) => {
            if (hub.name === hubName) {
                await hub.connect();
                const led = await hub.waitForDeviceByType(Consts.DeviceType.HUB_LED) as HubLED;
                led.setColor(this._color);
                console.log(`Connected to hub ${this._hubName}`);
                this._hub = hub;
                hub.on("disconnect", () => {
                    console.log(`Disconnected from hub ${this._hubName}`);
                    this._hub = undefined;
                });
            }
        });
    }

    public get color () {
        return this._color;
    }

    public async go (speed: number) {
        super.go(speed);
        if (this._hub) {
            speed = Math.round(12.5 * speed);
            speed = this._reverse ? -speed : speed;
            const motor = await this._hub.waitForDeviceAtPort(this.port) as any;
            motor.setPower(speed);
        }
    }

    public stop () {
        this.go(0);
    }

}
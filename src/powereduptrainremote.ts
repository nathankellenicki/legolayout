import PoweredUP, { Consts, HubLED, RemoteControl, Hub, RemoteControlButton } from "node-poweredup";
import { EventEmitter } from "events";
import Train from "./train";

export default class PoweredUPTrainRemote extends EventEmitter {

    private _remote: RemoteControl | undefined;
    private _poweredUp: PoweredUP;
    private _remoteName: string;
    private _name: string;
    private _trains: Train[];
    private _activeTrain: number;

    constructor (poweredUp: PoweredUP, name: string, remoteName: string, trains: Train[]) {
        super();
        this._poweredUp = poweredUp;
        this._remoteName = remoteName;
        this._name = name;
        this._trains = trains;
        this._activeTrain = 0;
        poweredUp.on("discover", async (hub: RemoteControl) => {
            if (hub.name === remoteName) {
                await hub.connect();
                const left = await hub.waitForDeviceAtPort("LEFT") as RemoteControlButton;
                left.on("remoteButton", ({ event }: { event: Consts.ButtonState }) => {
                    this._handleSpeedButtons(event);
                });
                hub.on("button", ({ event }: { event: Consts.ButtonState }) => {
                    this._handleTrainSwitcherButton(event);
                });
                this._remote = hub;
                this._setActiveColor();
                console.log(`Connected to remote ${this._remoteName}`);
                hub.on("disconnect", () => {
                    console.log(`Disconnected from remote ${this._remoteName}`);
                    this._remote = undefined;
                });
            }
        });
    }

    private _handleSpeedButtons (event: Consts.ButtonState) {
        const train = this._trains[this._activeTrain];
        if (event === Consts.ButtonState.UP) {
            train.increase();
        } else if (event === Consts.ButtonState.DOWN) {
            train.decrease();
        } else if (event === Consts.ButtonState.STOP) {
            train.stop();
        }
    }

    private _handleTrainSwitcherButton (event: Consts.ButtonState) {
        if (event === Consts.ButtonState.PRESSED) {
            this._activeTrain++;
            if (this._activeTrain > this._trains.length - 1) {
                this._activeTrain = 0;
            }
            this._setActiveColor();
        }
    }

    private async _setActiveColor () {
        const activeTrain = this._trains[this._activeTrain];
        // @ts-ignore
        const led = await this._remote.waitForDeviceByType(Consts.DeviceType.HUB_LED) as HubLED;
        // @ts-ignore
        if (activeTrain.color) {
            // @ts-ignore
            led.setColor(activeTrain.color);
        } else {
            led.setColor(Consts.Color.WHITE);
        }
    }

    public get isActive () {
        return !!this._remote;
    }

}
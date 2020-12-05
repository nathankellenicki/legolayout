import WeDo from "node-wedo";
import { EventEmitter } from "events";

enum State {
    DETECTED = 0,
    NOT_DETECTED = 1
}

export default class WeDoMotionSensor extends EventEmitter {

    public port: string;

    private _weDo: WeDo;
    private _name: string;
    private _state: State = State.NOT_DETECTED;
    private _isWaiting: boolean = false;
    private _distance: number = 80;

    private _timer: NodeJS.Timer | undefined;


    constructor (weDo: WeDo, name: string, port: string, distance: number = 80) {
        super();
        this._weDo = weDo;
        this._name = name;
        this._distance = distance;
        this.port = port;
        this._weDo.on("distance", (port, { distance }) => {
            // console.log(this._name, distance);
            if (port === this.port) {
                if (distance < this._distance) {
                    // console.log(this._name, distance);
                    this._isWaiting = false;
                    if (this._timer) {
                        clearTimeout(this._timer);
                    }
                    if (this._state !== State.DETECTED) {
                        this.emit("detected", State.DETECTED);
                    }
                    this._state = State.DETECTED;
                } else if (distance >= 70 && this._state === State.DETECTED && !this._isWaiting) {
                    if (!this._isWaiting) {
                        this._isWaiting = true;
                        this._timer = setTimeout(() => {
                            this._timer = undefined;
                            this._isWaiting = false;
                            this.emit("detected", State.NOT_DETECTED);
                            this._state = State.NOT_DETECTED;
                        }, 1000);
                    }
                }
            }
        });
    }

}
import ControlLab, { Consts } from "node-controllab";
import { EventEmitter } from "events";

import StreamingChangeDetection from "./streamingchangedetection";

export default class ControlLabMotionSensor extends EventEmitter {

    public port: number;

    private _controlLab: ControlLab;
    private _streamingChangeDetection: StreamingChangeDetection;
    private _name: string;
    private _isWaiting: boolean = false;


    constructor (controlLab: ControlLab, name: string, port: number) {
        super();
        this._controlLab = controlLab;
        this._name = name;
        this._streamingChangeDetection = new StreamingChangeDetection(10, 1, 15);
        this.port = port;
        this._streamingChangeDetection.on("detect", () => {
            if (!this._isWaiting) {
                this._isWaiting = true;
                this.emit("detected");
                setTimeout(() => {
                    this._isWaiting = false;
                }, 1000);
            }
        });
        this._controlLab.setSensorType(port, Consts.SensorType.LIGHT);
        this._controlLab.on("light", (port, { intensity }) => {
            // console.log(intensity);
            if (port === this.port) {
                this._streamingChangeDetection.add(intensity);
            }
        });
    }

}
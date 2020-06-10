export default abstract class Train {

    public name: string;

    private _speed: number = 0;

    constructor (name: string) {
        this.name = name;
    }

    public get speed () {
        return this._speed;
    }

    public go (speed: number) {
        this._speed = speed;
    }

    public increase () {
        if (this._speed < 8) {
            this.go(this._speed + 1);
        }
    }

    public decrease () {
        if (this._speed > -8) {
            this.go(this._speed - 1);
        }
    }

    public stop () {
        this._speed = 0;
    }

}
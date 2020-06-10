enum State {
    RED = 0,
    GREEN = 1
}

export default abstract class Signal {

    public name: string;

    private _state: State = State.RED;

    constructor (name: string) {
        this.name = name;
    }

    public get isGreen () {
        return this._state === State.GREEN;
    }

    public get isRed () {
        return this._state === State.RED;
    }

    public green () {
        this._state = State.GREEN;
    }

    public red () {
        this._state = State.RED;
    }

    public toggle () {
        if (this._state === State.RED) {
            this.green();
        } else {
            this.red();
        }
    }

}
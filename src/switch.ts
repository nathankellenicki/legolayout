enum State {
    LEFT = 0,
    RIGHT = 1
}

export default abstract class Switch {

    public name: string;

    private _state: State = State.LEFT;

    constructor (name: string) {
        this.name = name;
    }

    public get isLeft () {
        return this._state === State.LEFT;
    }

    public get isRight () {
        return this._state === State.RIGHT
    }

    public async left () {
        this._state = State.LEFT;
    }

    public async right () {
        this._state = State.RIGHT;
    }

    public async toggle () {
        if (this._state === State.LEFT) {
            await this.right();
        } else {
            await this.left();
        }
    }

}
export default class Ticker {
    start = performance.now();

    now = this.start;
    then = this.start;
    elapsed = this.now - this.start;
    delta = this.now - this.then;

    _fps = 60;
    frameInterval = 1000 / this._fps;

    get fps() {
        return this._fps;
    }

    set fps(value: number) {
        this._fps = value;
        this.frameInterval = 1000 / value;
    }

    /**
     * @returns True if this tick is available for animation.
     */
    tick(now: DOMHighResTimeStamp): boolean {
        this.now = now;
        this.elapsed = this.now - this.start;
        this.delta = this.now - this.then;

        if (this.delta > this.frameInterval) {
            this.then = this.now - (this.elapsed % this.frameInterval);
            return true;
        }

        return false;
    }
}

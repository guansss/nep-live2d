export default class Ticker {
    start = performance.now();

    now = this.start;
    then = this.start;
    delta = 0;

    tick() {
        this.now = performance.now();
        this.delta = this.now - this.then;
        this.then = this.now;
    }
}

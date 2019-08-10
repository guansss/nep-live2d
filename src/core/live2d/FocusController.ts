import { clamp } from 'lodash';

export default class FocusController {
    /** Minimum distance to respond */
    static EPSILON = 0.01;

    maxSpeed = 0.08;
    maxAccSpeed = 0.1;

    targetX = 0;
    targetY = 0;
    x = 0;
    y = 0;
    v = 0;

    constructor() {}

    focus(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    update(dt: DOMHighResTimeStamp) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        if (Math.abs(dx) < FocusController.EPSILON && Math.abs(dy) < FocusController.EPSILON) return;

        const d = Math.sqrt(dx ** 2 + dy ** 2);
        const v = clamp(d / dt, -this.maxSpeed, this.maxSpeed);
        const a = clamp((v - this.v) / dt, -this.maxAccSpeed, this.maxAccSpeed);
        this.v += a * dt;

        const dd = this.v * dt;
        this.x += dx / dd;
        this.y += dy / dd;

        // ==========================================================================================
        // Hmm, I can't understand this.
        //
        //            2  6           2               3
        //      sqrt(a  t  + 16 a h t  - 8 a h) - a t
        // v = --------------------------------------
        //                    2
        //                 4 t  - 2
        //(t=1)

        // var max_v = 0.5 * (Math.sqrt(MAX_A * MAX_A + 16 * MAX_A * d - 8 * MAX_A * d) - MAX_A);
        // var cur_v = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        // if (cur_v > max_v) {
        //     this.vx *= max_v / cur_v;
        //     this.vy *= max_v / cur_v;
        // }
        // ==========================================================================================
    }
}

import { clamp } from 'lodash';

/** Minimum distance to respond */
const EPSILON = 0.01;

export default class FocusController {
    maxSpeed = 0.01;
    maxAccSpeed = 0.008;

    targetX = 0;
    targetY = 0;
    x = 0;
    y = 0;
    v = 0;

    focus(x: number, y: number) {
        this.targetX = x;
        this.targetY = y;
    }

    update(dt: DOMHighResTimeStamp) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        if (Math.abs(dx) < EPSILON && Math.abs(dy) < EPSILON) return;

        const d = Math.sqrt(dx ** 2 + dy ** 2);
        const v = clamp(d / dt, 0, this.maxSpeed);
        const a = clamp((v - this.v) / dt, -this.maxAccSpeed, this.maxAccSpeed);
        this.v += a * dt;

        const dd = this.v * dt;
        this.x += (dd * dx) / d;
        this.y += (dd * dy) / d;

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

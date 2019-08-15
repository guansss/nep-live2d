import { log } from '@/core/utils/log';
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

        // log(
        //     { tag: 'fc' },
        //     this.v.toFixed(3),
        //     this.targetX.toFixed(3),
        //     this.targetY.toFixed(3),
        //     this.x.toFixed(3),
        //     this.y.toFixed(3),
        // );

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

    updateModel(model: Live2DModelWebGL, offsetX: number, offsetY: number) {
        const x = this.x + offsetX;
        const y = this.y + offsetY;
        log(
            { tag: 'fc' },
            x, y, offsetX, offsetY,
        );

        model.setParamFloat('PARAM_ANGLE_X', x * 30, 1);
        model.setParamFloat('PARAM_ANGLE_Y', y * 30, 1);
        model.addToParamFloat('PARAM_ANGLE_Z', x * y * -30, 1);

        model.addToParamFloat('PARAM_BODY_ANGLE_X', x * 10, 1);

        model.addToParamFloat('PARAM_EYE_BALL_X', x, 1);
        model.addToParamFloat('PARAM_EYE_BALL_Y', y, 1);
    }
}

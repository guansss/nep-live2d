import { mat4 } from 'glmw';

const VIEW_MAX_LEFT = -2;
const VIEW_MAX_TOP = 2;
const VIEW_MAX_RIGHT = 2;
const VIEW_MAX_BOTTOM = -2;

type ModelLayout = { [p: string]: number }

export class Live2DModelMatrix {

    mat = mat4.create();

    setLayout(layout: ModelLayout) {
        [
            ['width', 'setWidth'],
            ['height', 'setHeight'],
            ['x', 'setX'],
            ['y', 'setY'],
            ['center_x', 'centerX'],
            ['center_y', 'centerY'],
            ['top', 'top'],
            ['right', 'right'],
            ['bottom', 'bottom'],
            ['left', 'left'],
        ].forEach(([paramId, method]) => {
            const value = layout[paramId];
            if (value) {
                (this.modelMatrix[method] as (param: number) => void)(value);
            }
        });
    }
}

export class Live2DViewMatrix {

    mat = mat4.create();

    get view() {
        return mat4.view(this.mat);
    }

    screenLeft = VIEW_MAX_LEFT;
    screenTop = VIEW_MAX_TOP;
    screenRight = VIEW_MAX_RIGHT;
    screenBottom = VIEW_MAX_BOTTOM;

    maxLeft = null;
    maxRight = null;
    maxTop = null;
    maxBottom = null;
    max = Number.MAX_VALUE;
    min = 0;
}
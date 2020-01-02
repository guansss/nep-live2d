/**
 * Based on https://codepen.io/bsehovac/pen/GPwXxq
 */

import { BLEND_MODES, DRAW_MODES } from '@pixi/constants';
import { Buffer, Geometry, Shader, State, Texture } from '@pixi/core';
import { Mesh } from '@pixi/mesh';
import frag from 'raw-loader!./snow.frag';
import vert from 'raw-loader!./snow.vert';

const TAG = 'Snow';

export const DEFAULT_OPTIONS = {
    number: 100,
    width: 100,
    height: 100,
    minSize: 75,
    maxSize: 150,
};

export class Wind {
    current = 0;
    force = 0.1;
    target = 0.1;
    min = 0.02;
    max = 0.2;
    easing = 0.003;

    update(dt: DOMHighResTimeStamp) {
        this.force += (this.target - this.force) * this.easing;
        this.current += this.force * (dt * 0.2);

        if (Math.random() > 0.995) {
            this.target = (this.min + Math.random() * (this.max - this.min)) * (Math.random() > 0.5 ? -1 : 1);
        }
    }
}

export default class Snow extends Mesh {
    static wind = new Wind();

    options = DEFAULT_OPTIONS;

    private _number: number;

    private _width = 0;
    private _height = 0;

    get number() {
        return this._number;
    }

    set number(value: number) {
        if (value !== this._number) {
            this._number = value;
            this.setup();
        } else {
            this._number = value;
        }
    }

    constructor(readonly textureSource: string, options: Partial<typeof DEFAULT_OPTIONS>) {
        super(
            new Geometry()
                .addAttribute('a_position', Buffer.from([]), 3)
                .addAttribute('a_rotation', Buffer.from([]), 3)
                .addAttribute('a_speed', Buffer.from([]), 3)
                .addAttribute('a_size', Buffer.from([]), 1)
                .addAttribute('a_alpha', Buffer.from([]), 1),
            Shader.from(vert, frag, {
                texture: Texture.from(textureSource, {
                    resourceOptions: {
                        premultiplyAlpha: false,
                    },
                }),
                time: 0,
                worldSize: [0, 0, 0],
                gravity: 100,
                wind: 0,
                projection: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            }),
            new State(),
            DRAW_MODES.POINTS,
        );

        Object.assign(this.options, options);

        this._width = this.options.width;
        this._height = this.options.height;
        this._number = this.options.number;

        this.state.blend = true;
        this.state.blendMode = BLEND_MODES.NORMAL_NPM;
        this.state.depthTest = false;

        this.setup();
    }

    setup() {
        const boundWidth = this._width;
        const boundHeight = this._height;

        // z in range from -80 to 80, camera distance is 100
        // max height at z of -80 is 110
        const height = 110;
        const width = (boundWidth / boundHeight) * height;
        const depth = 80;

        const maxSize = 5000 * this.options.maxSize;
        const minSize = 5000 * this.options.minSize;

        const position = [];
        const rotation = [];
        const speed = [];
        const size = [];
        const alpha = [];

        for (let i = (boundWidth / boundHeight) * this.number; i > 0; i--) {
            // prettier-ignore
            position.push(
                -width + Math.random() * width * 2,
                -height + Math.random() * height * 2,
                Math.random() * depth * 2,
            );

            // prettier-ignore
            rotation.push(
                Math.random() * 2 * Math.PI,
                Math.random() * 20,
                Math.random() * 10,
            ); // angle, speed, sinusoid

            // prettier-ignore
            speed.push(
                0.7 + Math.random(),
                0.7 + Math.random(),
                Math.random() * 10,
            ); // x, y, sinusoid

            size.push((maxSize - minSize) * Math.random() + minSize);

            alpha.push(0.1 + Math.random() * 0.2);
        }

        this.geometry.getBuffer('a_position').update(new Float32Array(position));
        this.geometry.getBuffer('a_rotation').update(new Float32Array(rotation));
        this.geometry.getBuffer('a_speed').update(new Float32Array(speed));
        this.geometry.getBuffer('a_size').update(new Float32Array(size));
        this.geometry.getBuffer('a_alpha').update(new Float32Array(alpha));

        const aspect = boundWidth / boundHeight;
        const fov = 60;
        const near = 1;
        const far = 10000;
        const z = 100;

        const fovRad = fov * (Math.PI / 180);
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fovRad);
        const rangeInv = 1.0 / (near - far);

        // prettier-ignore
        this.shader.uniforms.projection = [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2 + z, z,
        ];

        this.shader.uniforms.worldSize = [width, height, depth];
    }

    resize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.setup();
    }

    _calculateBounds() {
        this._bounds.addFrame(this.transform, 0, 0, this._width, this._height);
    }

    update(dt: DOMHighResTimeStamp, now: DOMHighResTimeStamp) {
        this.shader.uniforms.time = now / 5000;
        this.shader.uniforms.wind = Snow.wind.current;
    }
}

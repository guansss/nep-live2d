/**
 * Original source: https://codepen.io/bsehovac/pen/GPwXxq
 */

import { DRAW_MODES } from '@pixi/constants';
import { Buffer, Geometry, Renderer, Shader, State, Texture } from '@pixi/core';
import { Mesh } from '@pixi/mesh';
import frag from 'raw-loader!./snow.frag';
import vert from 'raw-loader!./snow.vert';

export class Wind {
    current = 0;
    force = 0.1;
    target = 0.1;
    min = 0.1;
    max = 0.25;
    easing = 0.005;
}

const TAG = 'Snow';

export default class Snow extends Mesh {
    wind = new Wind();

    constructor(readonly textureSource: string, width = 100, height = 100, public number = 100) {
        super(
            new Geometry()
                .addAttribute('a_position', Buffer.from([]), 3)
                .addAttribute('a_rotation', Buffer.from([]), 3)
                .addAttribute('a_speed', Buffer.from([]), 3)
                .addAttribute('a_size', Buffer.from([]), 1)
                .addAttribute('a_color', Buffer.from([]), 4),
            Shader.from(vert, frag, {
                texture: Texture.from(textureSource),
                time: 0,
                worldSize: [0, 0, 0],
                gravity: 100,
                wind: 0,
                projection: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            }),
            new State(),
            DRAW_MODES.POINTS,
        );

        this._bounds.minX = 0;
        this._bounds.minY = 0;
        this._bounds.maxX = width;
        this._bounds.maxY = height;

        this.state.blend = true;
        this.state.depthTest = false;
        this.state.culling = true;

        this.setup();
    }

    protected setup() {
        console.log(this.shader.uniforms.texture);
        const boundWidth = this._bounds.maxX - this._bounds.minX;
        const boundHeight = this._bounds.maxY - this._bounds.minY;

        // z in range from -80 to 80, camera distance is 100
        // max height at z of -80 is 110
        const height = 110;
        const width = (boundWidth / boundHeight) * height;
        const depth = 80;

        const baseSize = 5000;

        const position = [];
        const color = [];
        const size = [];
        const rotation = [];
        const speed = [];
        let alpha;

        for (let i = (boundWidth / boundHeight) * this.number; i > 0; i--) {
            // prettier-ignore
            position.push(
                -width + Math.random() * width * 2,
                -height + Math.random() * height * 2,
                Math.random() * depth * 2,
            );

            // prettier-ignore
            speed.push(
                1 + Math.random(),
                1 + Math.random(),
                Math.random() * 10,
            ); // x, y, sinusoid

            // prettier-ignore
            rotation.push(
                Math.random() * 2 * Math.PI,
                Math.random() * 20,
                Math.random() * 10,
            ); // angle, speed, sinusoid

            color.push(1, 1, 1, 0.1 + Math.random() * 0.2);

            size.push(baseSize * Math.random());
        }

        this.geometry.getBuffer('a_position').update(new Float32Array(position));
        this.geometry.getBuffer('a_rotation').update(new Float32Array(rotation));
        this.geometry.getBuffer('a_speed').update(new Float32Array(speed));
        this.geometry.getBuffer('a_size').update(new Float32Array(size));
        this.geometry.getBuffer('a_color').update(new Float32Array(color));

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
        this._bounds.maxX = width;
        this._bounds.maxY = height;
        this.setup();
    }

    _calculateBounds() {
        // override it to prevent default calculation
    }

    update(dt: DOMHighResTimeStamp, now: DOMHighResTimeStamp) {
        this.wind.force += (this.wind.target - this.wind.force) * this.wind.easing;
        this.wind.current += this.wind.force * (dt * 0.2);

        if (Math.random() > 0.995) {
            this.wind.target =
                (this.wind.min + Math.random() * (this.wind.max - this.wind.min)) * (Math.random() > 0.5 ? -1 : 1);
        }

        this.shader.uniforms.time = now / 5000;
        this.shader.uniforms.wind = this.wind.current;
    }

    render(renderer: Renderer) {
        super.render(renderer);
    }
}

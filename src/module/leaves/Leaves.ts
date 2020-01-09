import { clamp, rand } from '@/core/utils/math';
import { LEAVES_NUMBER_MAX } from '@/defaults';
import { Point } from '@pixi/math';
import { ParticleContainer } from '@pixi/particles';
import { Sprite } from '@pixi/sprite';

export const DEFAULT_OPTIONS = {
    number: 50,
    width: 500,
    height: 500,
    minSize: 90,
    maxSize: 150,
    g: 0.0001, // gravity, pixel/ms^2
    minSpeed: 0.1,
    maxSpeed: 0.3,
    minDropRate: 2000,
    dropInterval: 5000,
    multiply: 3,
    autoFall: true,
};

const NUMBER_LIMIT = LEAVES_NUMBER_MAX * 1.2; // don't make too many piece leaves...
const MAX_ANCHOR_OFFSET = 5;
const PIECE_RATIO = 0.8;
const NORMAL_FADING_STEP = 0.02;
const SPLIT_FADING_STEP = 0.1;

export default class Leaves extends ParticleContainer {
    private _number: number;

    private _width: number;
    private _height: number;

    get number() {
        return this._number;
    }

    set number(value: number) {
        this._number = value;
        this.options.number = value;
        this.updateLeaves();
    }

    options = DEFAULT_OPTIONS;

    leaves: Leaf[] = [];

    nextFallTime = performance.now();

    constructor(readonly textures: PIXI.Texture[], options: Partial<typeof DEFAULT_OPTIONS>) {
        super(NUMBER_LIMIT, { vertices: true, rotation: true, tint: true });

        Object.assign(this.options, options);

        this._width = this.options.width;
        this._height = this.options.height;
        this._number = this.options.number;

        this.updateLeaves();
    }

    updateLeaves() {
        const texturesNumber = this.textures.length;
        const normalLeavesNumber = this.leaves.reduce((sum, leaf) => (leaf.piece ? sum : sum + 1), 0);
        let delta = this._number - normalLeavesNumber;

        if (texturesNumber === 0 || delta === 0) return;

        if (delta >= 0) {
            for (let i = 0, leaf; i < delta; i++) {
                leaf = new Leaf(this.textures[~~rand(0, texturesNumber)], this, this.options);

                this.leaves.push(leaf);
                this.addChild(leaf);
            }
        } else {
            let removed: Leaf[] = [];
            let start = 0;
            let loops = 0; // don't bring me troubles...

            while (delta < 0) {
                let end = start;

                while (delta < 0 && this.leaves[end] && !this.leaves[end].piece) {
                    delta++;
                    end++;
                }

                removed = removed.concat(this.leaves.splice(start, end - start));

                start++;

                if (start >= this.leaves.length || loops++ > 20) break;
            }

            this.removeChild(...removed);
        }
    }

    hit(x: number, y: number) {
        const point = new Point(x, y);
        let hasOneSplit = false;

        for (let i = this.children.length - 1, leaf: Leaf; i >= 0; i--) {
            leaf = this.children[i] as Leaf;

            if (leaf.alpha > 0) {
                if (!leaf.falling) {
                    leaf.updateTransform();

                    if (leaf.containsPoint(point)) {
                        leaf.falling = true;
                    }
                } else if (!hasOneSplit && this.children.length < NUMBER_LIMIT) {
                    leaf.updateTransform();

                    if (leaf.containsPoint(point)) {
                        hasOneSplit = true;

                        for (let j = rand(2, Math.max(2, this.options.multiply)); j > 0; j--) {
                            this.addChild(Leaf.splitFrom(leaf, this));
                        }
                    }
                }
            }
        }
    }

    update(dt: DOMHighResTimeStamp, now: DOMHighResTimeStamp) {
        const options = this.options;

        let shouldFall = options.autoFall && now > this.nextFallTime;

        if (shouldFall) {
            // TODO: relate to wind force

            /*
             * make a variant of sine wave!
             *
             *    |
             *  1 |_     _______     ______
             *    | \   /       \   /                  sin(t) - 0.4 + |sin(t) - 0.4|
             *    |  '-'         '-'               1 - _____________________________
             *  0 |___________________________                      2
             */

            const sin = Math.sin(now / options.dropInterval) - 0.4;

            this.nextFallTime = now + (1 - (sin + Math.abs(sin) / 2)) * options.minDropRate;
        }

        const removals = [];
        let leaf: Leaf;
        let t: number;
        let sqt: number;

        for (let i = this.children.length - 1; i >= 0; i--) {
            leaf = this.children[i] as Leaf;

            // fade-in newly grown leaves, fade-out split leaves
            leaf.alpha = clamp(leaf.alpha + leaf.fadingStep, 0, 1);

            if (leaf.falling) {
                if (leaf.y < leaf.maxY) {
                    if (leaf.vy < leaf.maxSpeed) {
                        leaf.vy += options.g * dt;
                    }

                    if (leaf.piece) {
                        leaf.rotation += leaf.vy * leaf.rotationSpeed * dt;
                    } else {
                        // ease-in-out curve, see Solution 3 from https://stackoverflow.com/a/25730573
                        t = leaf.maxRotation - Math.abs(leaf.rotation);
                        sqt = t ** 2;
                        leaf.rotation += (sqt / (2 * (sqt - t) + 1)) * leaf.rotationSpeed * dt;
                    }

                    leaf.y += leaf.vy * dt;
                } else if (leaf.piece) {
                    // remove piece leaves when they fall to ground
                    removals.push(leaf);
                } else {
                    // reset normal leaves to top when they fall to ground
                    leaf.reset(this);
                }
            } else if (shouldFall) {
                // drop at most one leaf at a time
                shouldFall = false;
                leaf.falling = true;
            }
        }

        if (removals.length !== 0) this.removeChild(...removals);
    }

    resize(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    _calculateBounds() {
        this._bounds.addFrame(this.transform, 0, 0, this._width, this._height);
    }

    clone() {
        return new Leaves(this.textures, {
            ...this.options,
            number: this._number,
        });
    }
}

class Leaf extends Sprite {
    // TODO: Horizontal movement
    // vx = 0;
    vy = 0;

    maxY: number; // when Y reaches this value, the leaf is considered to fall to ground
    maxSpeed: number;
    maxRotation = rand(Math.PI / 2.5, Math.PI / 1.5);

    falling = false;
    split = false;
    piece = false;

    direction: -1 | 1 = Math.random() > 0.5 ? 1 : -1;
    rotationSpeed = this.direction * rand(0.0002, 0.0005);
    fadingStep = NORMAL_FADING_STEP;

    constructor(texture: PIXI.Texture, container: PIXI.Container, readonly options: typeof DEFAULT_OPTIONS) {
        super(texture);

        const size = ~~rand(options.minSize, options.maxSize);
        this.width = size;
        this.height = size;

        this.anchor.set(0.5, 0.5);
        this.maxY = container.height + size * 0.5;
        this.maxSpeed = rand(options.minSpeed, options.maxSpeed);

        this.reset(container);
    }

    reset(container: PIXI.Container) {
        this.falling = false;
        this.split = false;
        this.x = rand(0, container.width);
        this.y = rand(-0.3, 0.3) * this.height;
        this.vy = 0;
        this.alpha = 0;
        this.fadingStep = NORMAL_FADING_STEP;

        this.rotation = this.direction * rand(0, Math.PI / 3);
    }

    static splitFrom(leaf: Leaf, container: PIXI.Container) {
        leaf.split = true;
        leaf.fadingStep = -SPLIT_FADING_STEP; // prepare to fade out

        const piece = new Leaf(leaf.texture, container, leaf.options);

        piece.piece = true;
        piece.falling = true;

        piece.vy = leaf.vy * 1.5;
        piece.width = leaf.width * PIECE_RATIO;
        piece.height = leaf.height * PIECE_RATIO;
        piece.rotation = leaf.rotation;
        piece.fadingStep = SPLIT_FADING_STEP;

        const ax = rand(-MAX_ANCHOR_OFFSET, MAX_ANCHOR_OFFSET);
        const ay = rand(-MAX_ANCHOR_OFFSET, MAX_ANCHOR_OFFSET);

        piece.anchor.set(ax, ay);
        piece.x = leaf.x;
        piece.y = leaf.y;

        /*
         * The accurate value should be:
         *
         * container.height + piece.height * Math.sqrt(ax ** 2 + ay ** 2)
         *
         * But using `MAX_ANCHOR_OFFSET` is faster and the error can be just ignored
         */
        piece.maxY = container.height + piece.height * MAX_ANCHOR_OFFSET;

        /*
         * Offset to correct position by the new transform.
         *
         *            w
         * originX = ___ * [(ax' - 0.5) * R - (ax - 0.5)]
         *            R
         *                               ax - 0.5
         *         = w * [(ax' - 0.5) - __________]
         *                                  R
         *
         * ax' = piece.anchor.x
         * ax  = leaf.anchor.x
         */
        const origin = new Point(
            piece.texture.width * (ax - 0.5 - (leaf.anchor.x - 0.5) / PIECE_RATIO),
            piece.texture.height * (ay - 0.5 - (leaf.anchor.y - 0.5) / PIECE_RATIO),
        );
        piece.toGlobal(origin, piece.position);

        piece.rotationSpeed = clamp(leaf.rotationSpeed * 3, -0.01, 0.01);
        piece.maxRotation = Infinity;

        return piece;
    }
}

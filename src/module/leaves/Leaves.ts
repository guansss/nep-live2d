import { rand } from '@/core/utils/math';
import { LEAVES_NUMBER_MAX } from '@/defaults';
import { Loader } from '@pixi/loaders';
import { Point } from '@pixi/math';
import { ParticleContainer } from '@pixi/particles';
import { Sprite } from '@pixi/sprite';

const DEFAULT_OPTIONS = {
    number: 50,
    width: 500,
    height: 500,
    minSize: 75,
    maxSize: 150,
    rotationSpeed: 0.001,
    g: 0.0005, // gravity, pixel/ms^2
    maxSpeed: 0.5, // pixel/ms
    minDropRate: 2000,
    dropInterval: 5000,
    multiply: 3,
    autoFall: true,
};

export default class Leaves extends ParticleContainer {
    private _number: number;

    private _width: number;
    private _height: number;

    get number() {
        return this._number;
    }

    set number(value: number) {
        this._number = value;
        this.updateLeaves();
    }

    options = DEFAULT_OPTIONS;

    textures: PIXI.Texture[] = [];

    leaves: Leaf[] = [];

    nextFallTime = performance.now();

    constructor(sheetSource: string, options: Partial<typeof DEFAULT_OPTIONS>) {
        super(LEAVES_NUMBER_MAX, { vertices: true, rotation: true, tint: true });

        new Loader()
            .add(sheetSource)
            .load((loader: Loader, resources: Partial<Record<string, PIXI.LoaderResource>>) => {
                this.textures = Object.values(resources[sheetSource]!.spritesheet!.textures);
                this.updateLeaves();
            });

        Object.assign(this.options, options);

        this._width = this.options.width;
        this._height = this.options.height;
        this._number = this.options.number;
    }

    updateLeaves() {
        const texturesNumber = this.textures.length;
        const delta = this._number - this.leaves.length;

        if (texturesNumber === 0 || delta === 0) return;

        if (delta >= 0) {
            for (let i = 0, leaf; i < delta; i++) {
                leaf = new Leaf(this.textures[~~rand(0, texturesNumber)], this.options, this.width);

                this.leaves.push(leaf);
                this.addChild(leaf);
            }
        } else {
            const removed = this.leaves.splice(delta);
            this.removeChild(...removed);
        }
    }

    hit(x: number, y: number) {
        for (let i = this.children.length - 1, leaf: Leaf; i >= 0; i--) {
            leaf = this.children[i] as Leaf;

            if (leaf.alpha === 1 && leaf.containsPoint(new Point(x, y))) {
                if (!leaf.falling) {
                    leaf.falling = true;
                } else {
                    for (let j = rand(0, this.options.multiply); j > 0; i--) {
                        leaf = Leaf.scatterFrom(leaf);
                        this.addChild(leaf);
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
             *    |  '-'         '-'               1 - -----------------------------
             *  0 |___________________________                      2
             */

            const sin = Math.sin(now / options.dropInterval) - 0.4;

            this.nextFallTime = now + (1 - (sin + Math.abs(sin) / 2)) * options.minDropRate;
        }

        const removals = [];

        for (let i = this.children.length - 1, leaf; i >= 0; i--) {
            leaf = this.children[i] as Leaf;

            if (leaf.alpha < 1) leaf.alpha += 0.02;

            if (leaf.y < options.height) {
                if (leaf.scattered || leaf.falling) {
                    if (leaf.vy < options.maxSpeed) leaf.vy += options.g * dt;

                    if (leaf.rotation < leaf.maxRotation && leaf.rotation > -leaf.maxRotation) {
                        leaf.rotation += leaf.vy * leaf.rotationSpeed * dt;
                    }

                    leaf.y += leaf.vy * dt;
                } else if (shouldFall) {
                    // drop at most one leaf at a time
                    shouldFall = false;
                    leaf.falling = true;
                }
            } else {
                if (leaf.scattered) {
                    // remove scattered leaves when they fall to ground
                    removals.push(leaf);
                } else {
                    // reset normal leaves to top when they fall to ground
                    leaf.reset(this.width);
                }
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
}

class Leaf extends Sprite {
    // TODO: Horizontal movement
    // vx = 0;
    vy = 0;

    scattered = false;
    falling = false;

    direction: -1 | 1 = Math.random() > 0.5 ? 1 : -1;
    rotationSpeed = 0;
    maxRotation = Math.PI / 2;

    constructor(texture: PIXI.Texture, readonly options: typeof DEFAULT_OPTIONS, containerWidth?: number) {
        super(texture);

        const size = ~~rand(options.minSize, options.maxSize);
        this.width = size;
        this.height = size;
        this.anchor.set(0.5, 0.5);
        this.rotationSpeed = this.direction * rand(0.0005, options.rotationSpeed);

        this.reset(containerWidth || options.width);
    }

    reset(containerWidth: number) {
        this.falling = false;
        this.x = rand(0, containerWidth);
        this.y = rand(-0.4, 0.4) * this.height;
        this.vy = 0;
        this.alpha = 0;

        this.rotation = this.direction * Math.random() * (Math.PI / 3);
    }

    static scatterFrom(leaf: Leaf) {
        const scattered = new Leaf(leaf.texture, leaf.options);

        scattered.scattered = true;

        scattered.transform.localTransform.copyFrom(leaf.transform.localTransform);
        scattered.transform.worldTransform.copyFrom(leaf.transform.worldTransform);
        scattered.vy = leaf.vy;
        scattered.width = leaf.width * 0.8;
        scattered.height = leaf.height * 0.8;

        const ax = rand(0.05, 3);
        const ay = rand(0.05, 3);

        scattered.anchor.set(ax, ay);
        scattered.x = leaf.x + (ax - 0.5) * leaf.width;
        scattered.y = leaf.y + (ay - 0.5) * leaf.height;

        scattered.rotationSpeed = leaf.rotationSpeed * 3; // rotate faster!
        scattered.maxRotation = Infinity;

        return scattered;
    }
}

import Live2DModel from '@/core/live2d/Live2DModel';
import Ticker from '@/core/mka/Ticker';
import { log } from '@/core/utils/log';
import { clamp } from '@/core/utils/math';
import Live2DTransform from '@/module/live2d/Live2DTransform';
import { Renderer, Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Point } from '@pixi/math';
import { Sprite } from '@pixi/sprite';

interface Live2DSprite {
    emit(event: 'hit', hitAreaName: string): boolean;

    emit(event: 'motion', group: string, index: number): boolean;
}

const _point = new Point();

let glContextID = -1;

class Live2DSprite extends Container {
    id!: number;

    textures: Texture[];

    texturesBound: boolean[];

    transform: Live2DTransform; // override the type

    highlightCover?: Sprite;

    static async create(file: string | string[]) {
        const model = await Live2DModel.create(file);
        return new Live2DSprite(model);
    }

    private constructor(public model: Live2DModel) {
        super();

        this.model.internalModel.getModelContext().clipManager.curFrameNo = glContextID;

        this.transform = new Live2DTransform(model);
        this.pivot.set(this.model.originalWidth / 2, this.model.originalHeight / 2);

        this.textures = model.modelSettings.textures.map(file =>
            Texture.from(file, { resourceOptions: { crossOrigin: true } }),
        );
        this.texturesBound = Array(this.textures.length).fill(false);

        const originalFn = model.motionManager.startMotionByPriority.bind(model.motionManager);

        /**
         * @fires Live2DSprite#motion
         */
        model.motionManager.startMotionByPriority = async (group, index, priority) => {
            const started = await originalFn(group, index, priority);
            if (started) {
                this.emit('motion', group, index);
            }
            return started;
        };
    }

    highlight(enabled: boolean) {
        if (enabled) {
            if (!this.highlightCover) {
                this.highlightCover = new Sprite(Texture.WHITE);
                this.highlightCover.width = this.model.width;
                this.highlightCover.height = this.model.height;
                this.highlightCover.alpha = 0.3;

                this.addChild(this.highlightCover);
            }
            this.highlightCover.visible = true;
        } else if (this.highlightCover) {
            this.highlightCover.visible = false;
        }
    }

    /**
     * Makes the model focus on a point.
     *
     * @param x - The x position in world space.
     * @param y - The y position in world space.
     */
    focus(x: number, y: number) {
        _point.x = x;
        _point.y = y;
        this.toModelPosition(_point, _point);

        this.model.focusController.focus(
            clamp((_point.x / this.model.originalWidth) * 2 - 1, -1, 1),
            -clamp((_point.y / this.model.originalHeight) * 2 - 1, -1, 1),
        );
    }

    /**
     * Performs hit action on sprite.
     *
     * @param x - The x position in world space.
     * @param y - The y position in world space.
     *
     * @fires Live2DSprite#hit
     */
    hit(x: number, y: number) {
        _point.x = x;
        _point.y = y;
        this.toModelPosition(_point, _point);

        this.model.hitTest(_point.x, _point.y).forEach(hitAreaName => {
            log(this.model.tag, `Hit`, hitAreaName);
            this.emit('hit', hitAreaName);
        });
    }

    /**
     * Gets the position in original (unscaled) Live2D model.
     * @param position - The point in world space.
     * @param point - The point to store new value.
     */
    toModelPosition(position: Point, point?: Point) {
        point = point || new Point();

        const transform = this.transform.worldTransform;
        const model = this.model;

        point.x = ((position.x - transform.tx) / transform.a - model.matrix.tx) / model.matrix.a;
        point.y = ((position.y - transform.ty) / transform.d - model.matrix.ty) / model.matrix.d;

        return point;
    }

    _calculateBounds() {
        this._bounds.addFrame(this.transform, 0, 0, this.model.width, this.model.height);
    }

    _render(renderer: Renderer) {
        // reset these renderer systems to make Live2D's drawing system compatible with Pixi
        renderer.batch.reset();
        renderer.geometry.reset();
        renderer.shader.reset();
        renderer.state.reset();

        this.model.internalModel.drawParamWebGL.setGL(renderer.gl);
        this.model.internalModel.drawParamWebGL.glno = (renderer as any).CONTEXT_UID;

        // a temporary workaround for the frame buffers
        if ((renderer as any).CONTEXT_UID !== glContextID) {
            glContextID = (renderer as any).CONTEXT_UID;
            const clipManager = this.model.internalModel.getModelContext().clipManager;
            clipManager.curFrameNo = glContextID;
            clipManager.getMaskRenderTexture();
        }

        for (let i = 0, baseTexture; i < this.textures.length; i++) {
            baseTexture = this.textures[i].baseTexture;

            // don't render if any of textures is not ready
            if (!baseTexture.valid) {
                return;
            }

            if (!this.texturesBound[i]) {
                this.texturesBound[i] = true;

                // update the texture once it's ready, the binding location is not important
                renderer.gl.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, true);
                renderer.texture.bind(baseTexture, 0);
                renderer.gl.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, false);

                // bind the WebGLTexture generated by Pixi's TextureSystem
                // kind of ugly but this does the trick :/
                this.model.bindTexture(i, (baseTexture as any)._glTextures[(renderer as any).CONTEXT_UID].texture);
            }

            // manually update the GC counter so it won't be GCed
            (baseTexture as any).touched = renderer.textureGC.count;
        }

        this.model.update(Ticker.delta, Ticker.now);
        this.model.draw(this.transform.getDrawingMatrix(renderer.gl));

        // reset the active texture because it's been changed by Live2D's drawing system
        renderer.gl.activeTexture(WebGLRenderingContext.TEXTURE0 + renderer.texture.currentLocation);
    }
}

export default Live2DSprite;

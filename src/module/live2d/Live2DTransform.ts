import Live2DModel, { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/core/live2d/Live2DModel';
import { Matrix, Transform } from '@pixi/math';

export default class Live2DTransform extends Transform {
    drawingMatrix = new Matrix();

    needsUpdate = false;

    constructor(readonly model: Live2DModel) {
        super();
    }

    /** @override */
    updateTransform(parentTransform: Transform) {
        const lastWorldID = this._worldID;

        super.updateTransform(parentTransform);

        if (this._worldID !== lastWorldID) {
            this.needsUpdate = true;
        }
    }

    /**
     * Generates a matrix for Live2D model to draw.
     */
    getDrawingMatrix(gl: WebGLRenderingContext): Matrix {
        if (this.needsUpdate) {
            this.needsUpdate = false;

            this.drawingMatrix
                .copyFrom(this.worldTransform)

                // convert to Live2D coordinate
                .scale(LOGICAL_WIDTH / gl.drawingBufferWidth, LOGICAL_HEIGHT / gl.drawingBufferHeight)

                // move the Live2D origin from center to top-left
                .translate(-LOGICAL_WIDTH / 2, -LOGICAL_HEIGHT / 2)

                .append(this.model.matrix);
        }

        return this.drawingMatrix;
    }
}

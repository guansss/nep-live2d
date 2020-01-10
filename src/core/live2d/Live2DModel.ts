import FocusController from '@/core/live2d/FocusController';
import Live2DEyeBlink from '@/core/live2d/Live2DEyeBlink';
import { loadModel, loadModelSettings, loadPhysics, loadPose } from '@/core/live2d/Live2DLoader';
import Live2DPhysics from '@/core/live2d/Live2DPhysics';
import Live2DPose from '@/core/live2d/Live2DPose';
import ModelSettings from '@/core/live2d/ModelSettings';
import MotionManager from '@/core/live2d/MotionManager';
import { log } from '@/core/utils/log';
import { randomID } from '@/core/utils/string';

export default class Live2DModel {
    tag = 'Live2DModel(uninitialized)';

    name: string;
    motionManager: MotionManager;

    eyeBlink: Live2DEyeBlink;
    physics?: Live2DPhysics;
    pose?: Live2DPose;

    readonly width: number;
    readonly height: number;

    /** Logical size in Live2D drawing, typically equals to 2 */
    readonly logicalWidth: number;
    readonly logicalHeight: number;

    /** Offset to translate model to center position. */
    readonly offsetX: number;
    readonly offsetY: number;

    focusController = new FocusController();

    static async create(file: string) {
        const modelSettings = await loadModelSettings(file);
        if (!modelSettings) throw `Failed to load model settings from "${file}"`;

        const internalModel = await loadModel(modelSettings.model);

        return new Live2DModel(internalModel!, modelSettings);
    }

    private constructor(readonly internalModel: Live2DModelWebGL, public modelSettings: ModelSettings) {
        this.name = modelSettings.name || randomID();
        this.tag = `Live2DModel\n(${this.name})`;

        this.motionManager = new MotionManager(
            this.name,
            internalModel,
            modelSettings.motions,
            modelSettings.expressions,
        );
        this.eyeBlink = new Live2DEyeBlink(internalModel);

        if (modelSettings.pose) {
            loadPose(modelSettings.pose, internalModel)
                .then(pose => (this.pose = pose))
                .catch(e => log(this.tag, e));
        }

        if (modelSettings.physics) {
            loadPhysics(modelSettings.physics, internalModel)
                .then(physics => (this.physics = physics))
                .catch(e => log(this.tag, e));
        }

        this.width = internalModel.getCanvasWidth();
        this.height = internalModel.getCanvasHeight();

        const layout = Object.assign(
            {
                width: 2,
                height: 2,
                centerX: 0,
                centerY: 0,
            },
            modelSettings.layout,
        );
        this.logicalWidth = layout.width;
        this.logicalHeight = layout.height;
        this.offsetX = layout.centerX - layout.width / 2;
        this.offsetY = layout.centerY - layout.height / 2;

        if (modelSettings.initParams) {
            modelSettings.initParams.forEach(({ id, value }) => internalModel.setParamFloat(id, value));
        }
        if (modelSettings.initOpacities) {
            modelSettings.initOpacities.forEach(({ id, value }) => internalModel.setPartsOpacity(id, value));
        }

        internalModel.saveParam();
    }

    bindTexture(index: number, texture: WebGLTexture) {
        this.internalModel.setTexture(index, texture);
    }

    /**
     * Hit test on model.
     *
     * @param x - The x position in model canvas.
     * @param y - The y position in model canvas.
     *
     * @returns The names of hit areas that have passed the test.
     */
    hitTest(x: number, y: number): string[] {
        log(this.tag, `Hit (${x}, ${y})`);

        if (this.internalModel && this.modelSettings.hitAreas) {
            return this.modelSettings.hitAreas
                .filter(({ name, id }) => {
                    let drawIndex = this.internalModel.getDrawDataIndex(id);

                    if (drawIndex >= 0) {
                        const points = this.internalModel.getTransformedPoints(drawIndex);
                        let left = this.internalModel.getCanvasWidth();
                        let right = 0;
                        let top = this.internalModel.getCanvasHeight();
                        let bottom = 0;

                        for (let i = 0; i < points.length; i += 2) {
                            const px = points[i];
                            const py = points[i + 1];

                            if (px < left) left = px;
                            if (px > right) right = px;
                            if (py < top) top = py;
                            if (py > bottom) bottom = py;
                        }

                        return left <= x && x <= right && top <= y && y <= bottom;
                    }
                })
                .map(hitArea => hitArea.name);
        }

        return [];
    }

    update(dt: DOMHighResTimeStamp, now: DOMHighResTimeStamp, transform: Float32Array) {
        const model = this.internalModel;

        model.loadParam();

        const updated = this.motionManager.update();
        if (!updated) {
            this.eyeBlink.update(dt);
        }

        model.saveParam();

        // update focus and natural movements
        this.focusController.update(dt);
        const focusX = this.focusController.x;
        const focusY = this.focusController.y;
        const t = (now / 1000) * 2 * Math.PI;
        model.addToParamFloat('PARAM_EYE_BALL_X', focusX);
        model.addToParamFloat('PARAM_EYE_BALL_Y', focusY);
        model.addToParamFloat('PARAM_ANGLE_X', focusX * 30 + 15 * Math.sin(t / 6.5345) * 0.5);
        model.addToParamFloat('PARAM_ANGLE_Y', focusY * 30 + 8 * Math.sin(t / 3.5345) * 0.5);
        model.addToParamFloat('PARAM_ANGLE_Z', focusX * focusY * -30 + 10 * Math.sin(t / 5.5345) * 0.5);
        model.addToParamFloat('PARAM_BODY_ANGLE_X', focusX * 10 + 4 * Math.sin(t / 15.5345) * 0.5);
        model.setParamFloat('PARAM_BREATH', 0.5 + 0.5 * Math.sin(t / 3.2345));

        this.physics && this.physics.update(now);
        this.pose && this.pose.update(dt);

        model.update();

        transform[12] += this.offsetX;
        transform[13] -= this.offsetY;
        model.setMatrix(transform);
        model.draw();
    }
}

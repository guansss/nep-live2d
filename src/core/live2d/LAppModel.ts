import ModelSettings from '@/core/live2d/ModelSettings';
import MotionManager from '@/core/live2d/MotionManager';
import logger from '@/utils/log';
import { getArrayBuffer, getJSON } from '@/utils/net';
import { dirname } from 'path';
import { parse as urlParse } from 'url';

const log = logger('Live2DModel');

export default class Live2DModel {
    private coreModel?: Live2DModelWebGL;

    name?: string;

    baseDir = '';

    modelSettings?: ModelSettings;

    modelMatrix = null; // L2DModelMatrix
    eyeBlink = null; // L2DEyeBlink
    physics = null; // L2DPhysics
    pose = null; // L2DPose

    subtitles?: any;

    initialized = false;
    isTexLoaded = false;

    dragX = 0;
    dragY = 0;

    motionManager?: MotionManager;

    webGLContext: WebGLRenderingContext;
    readonly textures: WebGLTexture[] = [];

    constructor(file: string, webGLContext: WebGLRenderingContext) {
        this.webGLContext = webGLContext;

        this.load(file).then();
    }

    private async load(file) {
        const url = urlParse(file);
        this.baseDir = dirname(url.pathname);

        let modelSettingsJSON;

        try {
            modelSettingsJSON = await getJSON(file);
        } catch (e) {
            log.error('Failed to load model settings file', e);
            return;
        }

        try {
            const modelSettings = new ModelSettings(modelSettingsJSON, this.baseDir);
            this.modelSettings = modelSettings;
            this.name = modelSettings.name || randomID();

            await this.loadModelData(modelSettings);
            await this.loadTextures(modelSettings);

            await this.loadPose(modelSettings);
            await this.loadPhysics(modelSettings);
            await this.loadSubtitles(modelSettings);

            this.motionManager = new MotionManager(this.name, this.coreModel!, this.modelSettings!);
            this.initialized = true;
        } catch (e) {
            log.error('Failed to initialize model', e);
        }
    }

    private async loadModelData(modelSettings: ModelSettings) {
        const modelFile = modelSettings.model;
        log('Loading model file:', modelFile);

        try {
            const buffer = await getArrayBuffer(modelFile);

            this.coreModel = Live2DModelWebGL.loadModel(buffer);
        } catch (e) {
            log.error('Failed to load model file', e);
            return;
        }

        const error = Live2D.getError();
        if (error) {
            log.error('Failed to create model', error);
            return;
        }

        this.modelMatrix = new L2DModelMatrix(this.coreModel!.getCanvasWidth(), this.coreModel!.getCanvasHeight());
        this.modelMatrix!.setWidth(2);
        this.modelMatrix!.setCenterPosition(0, 0);
    }

    private async loadTextures(modelSettings: ModelSettings) {
        if (!this.coreModel) return;

        if (modelSettings.textures.length === 0) {
            log.error('Empty texture array');
            return;
        }

        modelSettings.textures.forEach(async (file, i) => {
            log('Loading texture:', file);

            const image = new Image();
            image.src = file;

            try {
                await promisify(image);
            } catch (e) {
                log.error('Failed to load texture image', e);
                return;
            }

            const texture = this.webGLContext.createTexture();
            if (!texture) {
                log.error('Failed to create texture using WebGL');
                return;
            }

            const gl = this.webGLContext;

            // not sure if these are necessary
            //
            // if (!this.coreModel.isPremultipliedAlpha()) {
            //     gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            // }
            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            this.textures.push(texture);
            this.coreModel!.setTexture(i, texture);
        });
    }

    private async loadPose(modelSettings: ModelSettings) {
        const buffer = await Live2DModel.loadData('pose', modelSettings.pose, 'ArrayBuffer');
        if (buffer) {
            this.pose = L2DPose.load(buffer);
            this.pose!.updateParam(this.coreModel!);
        }
    }

    private async loadPhysics(modelSettings: ModelSettings) {
        const buffer = await Live2DModel.loadData('physics', modelSettings.physics, 'ArrayBuffer');
        if (buffer) {
            this.physics = L2DPhysics.load(buffer);
        }
    }

    private async loadSubtitles(modelSettings: ModelSettings) {
        const json = await Live2DModel.loadData('subtitles', modelSettings.subtitle, 'JSON');
        if (json) {
            this.subtitles = json;
        }
    }

    private setup(modelSettings: ModelSettings) {
        if (modelSettings.layout) {
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
                const value = modelSettings.layout![paramId];
                if (value) {
                    (this.modelMatrix![method] as (param: number) => void)(value);
                }
            });
        }

        if (modelSettings.initParams) {
            modelSettings.initParams.forEach(({ id, value }) => this.coreModel!.setParamFloat(id, value));
        }
        if (modelSettings.initOpacities) {
            modelSettings.initOpacities.forEach(({ id, value }) => this.coreModel!.setPartsOpacity(id, value));
        }

        this.coreModel!.saveParam();
    }

    update(dt: number, now: DOMHighResTimeStamp) {
        if (!this.coreModel) return;

        var timeSec = timeMSec / 1000.0;
        var t = timeSec * 2 * Math.PI;

        if (this.motionManager) {

        }

        //-----------------------------------------------------------------

        this.live2DModel.loadParam();

        var update = this.motionManager.updateParam(this.live2DModel);
        if (!update) {
            if (this.eyeBlink) {
                this.eyeBlink.updateParam(this.live2DModel);
            }
        }

        this.live2DModel.saveParam();

        //-----------------------------------------------------------------

        if (this.expressionManager && this.expressions && !this.expressionManager.isFinished()) {
            this.expressionManager.updateParam(this.live2DModel);
        }

        this.live2DModel.addToParamFloat('PARAM_ANGLE_X', this.dragX * 30, 1);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Y', this.dragY * 30, 1);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Z', this.dragX * this.dragY * -30, 1);

        this.live2DModel.addToParamFloat('PARAM_BODY_ANGLE_X', this.dragX * 10, 1);

        this.live2DModel.addToParamFloat('PARAM_EYE_BALL_X', this.dragX, 1);
        this.live2DModel.addToParamFloat('PARAM_EYE_BALL_Y', this.dragY, 1);

        this.live2DModel.addToParamFloat('PARAM_ANGLE_X', Number(15 * Math.sin(t / 6.5345)), 0.5);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Y', Number(8 * Math.sin(t / 3.5345)), 0.5);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Z', Number(10 * Math.sin(t / 5.5345)), 0.5);
        this.live2DModel.addToParamFloat('PARAM_BODY_ANGLE_X', Number(4 * Math.sin(t / 15.5345)), 0.5);
        this.live2DModel.setParamFloat('PARAM_BREATH', Number(0.5 + 0.5 * Math.sin(t / 3.2345)), 1);

        if (this.physics) {
            this.physics.updateParam(this.live2DModel);
        }

        if (this.lipSync == null) {
            this.live2DModel.setParamFloat('PARAM_MOUTH_OPEN_Y', this.lipSyncValue);
        }

        if (this.pose) {
            this.pose.updateParam(this.live2DModel);
        }

        this.live2DModel.update();
    }

    hitTest(drawID: string, testX: number, testY: number) {
        let drawIndex = this.coreModel!.getDrawDataIndex(drawID);

        if (drawIndex < 0) return false;

        const points = this.coreModel!.getTransformedPoints(drawIndex);
        const left = this.coreModel!.getCanvasWidth();
        const right = 0;
        const top = this.coreModel!.getCanvasHeight();
        const bottom = 0;

        for (let j = 0; j < points.length; j = j + 2) {
            const x = points[j];
            const y = points[j + 1];

            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
        }
        const tx = this.modelMatrix!.invertTransformX(testX);
        const ty = this.modelMatrix!.invertTransformY(testY);

        return left <= tx && tx <= right && top <= ty && ty <= bottom;
    }

    release() {
        if (this.webGLContext) {
            this.textures.forEach(texture => this.webGLContext.deleteTexture(texture));
        }
    }

    private static async loadData(tag: string, file?: string, type: 'JSON' | 'ArrayBuffer') {
        log(`Loading ${tag}:`, file || '(missing)');

        if (file) {
            try {
                switch (type) {
                    case 'JSON':
                        return await getJSON(file);
                    case 'ArrayBuffer':
                        return await getArrayBuffer(file);
                }
            } catch (e) {
                log.error(`Failed to load ${tag}`, e);
                return;
            }
        }
    }
}

LAppModel.prototype.draw = function(gl) {
    //console.log("--> LAppModel.draw()");

    // if(this.live2DModel == null) return;

    MatrixStack.push();

    MatrixStack.multMatrix(this.modelMatrix.getArray());

    this.tmpMatrix = MatrixStack.getMatrix();
    this.live2DModel.setMatrix(this.tmpMatrix);
    this.live2DModel.draw();

    MatrixStack.pop();
};

LAppModel.prototype.hitTest = function(id, testX, testY) {
    var len = this.modelSetting.getHitAreaNum();
    for (var i = 0; i < len; i++) {
        if (id == this.modelSetting.getHitAreaName(i)) {
            var drawID = this.modelSetting.getHitAreaID(i);

            return this.hitTestSimple(drawID, testX, testY);
        }
    }

    return false;
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

import { getArrayBuffer } from '@/core/utils/net';
import { logger } from '@/core/utils/log';

const log = logger('Live2DModel');

//============================================================
//============================================================
//  class L2DBaseModel
//============================================================
//============================================================
function L2DBaseModel() {
    this.live2DModel = null; // ALive2DModel
    this.modelMatrix = null; // L2DModelMatrix
    this.eyeBlink = null; // L2DEyeBlink
    this.physics = null; // L2DPhysics
    this.pose = null; // L2DPose
    this.subtitles = null;
    this.debugMode = false;
    this.initialized = false;
    this.updating = false;
    this.alpha = 1;
    this.accAlpha = 0;
    this.lipSync = false;
    this.lipSyncValue = 0;
    this.accelX = 0;
    this.accelY = 0;
    this.accelZ = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.startTimeMSec = null;
    this.mainMotionManager = new L2DMotionManager(); //L2DMotionManager
    this.expressionManager = new L2DMotionManager(); //L2DMotionManager
    this.motions = {};
    this.expressions = {};

    this.isTexLoaded = false;
}

var texCounter = 0;

L2DBaseModel.prototype.getModelMatrix = function() {
    return this.modelMatrix;
};

L2DBaseModel.prototype.setAlpha = function(a /*float*/) {
    if (a > 0.999) a = 1;
    if (a < 0.001) a = 0;
    this.alpha = a;
};

L2DBaseModel.prototype.getAlpha = function() {
    return this.alpha;
};

L2DBaseModel.prototype.isInitialized = function() {
    return this.initialized;
};

L2DBaseModel.prototype.setInitialized = function(v /*boolean*/) {
    this.initialized = v;
};

L2DBaseModel.prototype.isUpdating = function() {
    return this.updating;
};

L2DBaseModel.prototype.setUpdating = function(v /*boolean*/) {
    this.updating = v;
};

L2DBaseModel.prototype.getLive2DModel = function() {
    return this.live2DModel;
};

L2DBaseModel.prototype.setLipSync = function(v /*boolean*/) {
    this.lipSync = v;
};

L2DBaseModel.prototype.setLipSyncValue = function(v /*float*/) {
    this.lipSyncValue = v;
};

L2DBaseModel.prototype.setAccel = function(x /*float*/, y /*float*/, z /*float*/) {
    this.accelX = x;
    this.accelY = y;
    this.accelZ = z;
};

L2DBaseModel.prototype.setDrag = function(x /*float*/, y /*float*/) {
    this.dragX = x;
    this.dragY = y;
};

L2DBaseModel.prototype.getMainMotionManager = function() {
    return this.mainMotionManager;
};

L2DBaseModel.prototype.getExpressionManager = function() {
    return this.expressionManager;
};

L2DBaseModel.prototype.loadModelData = async function(path) {
    const arrayBuffer = await getArrayBuffer(path);

    this.modelData = Live2DModelWebGL.loadModel(arrayBuffer);
    this.modelData.saveParam();

    const error = Live2D.getError();
    if (error) throw 'Failed to load model data' + error;

    this.modelMatrix = new L2DModelMatrix(this.modelData.getCanvasWidth(), this.modelData.getCanvasHeight());
    this.modelMatrix.setWidth(2);
    this.modelMatrix.setCenterPosition(0, 0);

    return this.modelData;
};

L2DBaseModel.prototype.loadTexture = function(no /*int*/, path /*String*/, callback) {
    texCounter++;

    var pm = Live2DFramework.getPlatformManager(); //IPlatformManager

    if (this.debugMode) pm.log('Load Texture : ' + path);

    var thisRef = this;

    var loadedImage = new Image();
    loadedImage.src = path;

    var thisRef = this;
    loadedImage.onload = function() {
        // create texture
        var canvas = document.getElementById('gl-canvas');
        var gl = getWebGLContext(canvas, { premultipliedAlpha: true });
        var texture = gl.createTexture();
        if (!texture) {
            console.error('Failed to generate gl texture name.');
            return -1;
        }

        if (this.live2DModel.isPremultipliedAlpha() == false) {
            // 乗算済アルファテクスチャ以外の場合
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loadedImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        this.live2DModel.setTexture(no, texture);

        // テクスチャオブジェクトを解放
        texture = null;

        texCounter--;
        if (texCounter == 0) thisRef.isTexLoaded = true;
        if (typeof callback == 'function') callback();
    };

    loadedImage.onerror = function() {
        console.error('Failed to load image : ' + path);
    };
};

L2DBaseModel.prototype.loadMotion = function(name /*String*/, path /*String*/, callback) {
    var pm = Live2DFramework.getPlatformManager(); //IPlatformManager

    if (this.debugMode) pm.log('Load Motion : ' + path);

    var motion = null; //Live2DMotion

    var thisRef = this;
    pm.loadBytes(path, function(buf) {
        motion = Live2DMotion.loadMotion(buf);
        if (name != null) {
            thisRef.motions[name] = motion;
        }
        callback(motion);
    });
};

L2DBaseModel.prototype.loadExpression = function(name /*String*/, path /*String*/, callback) {
    var pm = Live2DFramework.getPlatformManager(); //IPlatformManager

    if (this.debugMode) pm.log('Load Expression : ' + path);

    var thisRef = this;
    pm.loadBytes(path, function(buf) {
        if (name != null) {
            thisRef.expressions[name] = L2DExpressionMotion.loadJSON(buf);
        }
        if (typeof callback === 'function') callback();
    });
};

L2DBaseModel.prototype.loadPose = function(path /*String*/, callback) {
    var pm = Live2DFramework.getPlatformManager(); //IPlatformManager
    if (this.debugMode) pm.log('Load Pose : ' + path);
    var thisRef = this;
    try {
        pm.loadBytes(path, function(buf) {
            thisRef.pose = L2DPose.load(buf);
            if (typeof callback === 'function') callback();
        });
    } catch (e) {
        console.warn(e);
    }
};

L2DBaseModel.prototype.loadPhysics = function(path /*String*/) {
    var pm = Live2DFramework.getPlatformManager(); //IPlatformManager
    if (this.debugMode) pm.log('Load Physics : ' + path);
    var thisRef = this;
    try {
        pm.loadBytes(path, function(buf) {
            thisRef.physics = L2DPhysics.load(buf);
        });
    } catch (e) {
        console.warn(e);
    }
};

L2DBaseModel.prototype.loadSubtitles = function(path /*String*/) {
    var thisRef = this;
    try {
        ajax(path, false, function(buf) {
            thisRef.subtitles = JSON.parse(buf);
        });
    } catch (e) {
        console.warn(e);
    }
};

L2DBaseModel.prototype.hitTestSimple = function(drawID, testX, testY) {
    var drawIndex = this.live2DModel.getDrawDataIndex(drawID);

    if (drawIndex < 0) return false;

    var points = this.live2DModel.getTransformedPoints(drawIndex);
    var left = this.live2DModel.getCanvasWidth();
    var right = 0;
    var top = this.live2DModel.getCanvasHeight();
    var bottom = 0;

    for (var j = 0; j < points.length; j = j + 2) {
        var x = points[j];
        var y = points[j + 1];

        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
    }
    var tx = this.modelMatrix.invertTransformX(testX);
    var ty = this.modelMatrix.invertTransformY(testY);

    return left <= tx && tx <= right && top <= ty && ty <= bottom;
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DEyeBlink
//============================================================
//============================================================
function L2DEyeBlink() {
    this.nextBlinkTime = null /* TODO NOT INIT */; //
    this.stateStartTime = null /* TODO NOT INIT */; //
    this.blinkIntervalMsec = null /* TODO NOT INIT */; //
    this.eyeState = EYE_STATE.STATE_FIRST;
    this.blinkIntervalMsec = 4000;
    this.closingMotionMsec = 100;
    this.closedMotionMsec = 50;
    this.openingMotionMsec = 150;
    this.closeIfZero = true;
    this.eyeID_L = 'PARAM_EYE_L_OPEN';
    this.eyeID_R = 'PARAM_EYE_R_OPEN';
}

L2DEyeBlink.prototype.calcNextBlink = function() {
    var time /*long*/ = UtSystem.getUserTimeMSec();
    var r /*Number*/ = Math.random();
    return /*(long)*/ time + r * (2 * this.blinkIntervalMsec - 1);
};

L2DEyeBlink.prototype.setInterval = function(blinkIntervalMsec /*int*/) {
    this.blinkIntervalMsec = blinkIntervalMsec;
};

L2DEyeBlink.prototype.setEyeMotion = function(
    closingMotionMsec /*int*/,
    closedMotionMsec /*int*/,
    openingMotionMsec /*int*/,
) {
    this.closingMotionMsec = closingMotionMsec;
    this.closedMotionMsec = closedMotionMsec;
    this.openingMotionMsec = openingMotionMsec;
};

L2DEyeBlink.prototype.updateParam = function(model /*ALive2DModel*/) {
    //////////////////////////////////////////////
    return; // This function seems like useless //
    //////////////////////////////////////////////

    var time /*:long*/ = UtSystem.getUserTimeMSec();
    var eyeParamValue /*:Number*/;
    var t /*:Number*/ = 0;
    switch (this.eyeState) {
        case EYE_STATE.STATE_CLOSING:
            t = (time - this.stateStartTime) / this.closingMotionMsec;
            if (t >= 1) {
                t = 1;
                this.eyeState = EYE_STATE.STATE_CLOSED;
                this.stateStartTime = time;
            }
            eyeParamValue = 1 - t;
            break;
        case EYE_STATE.STATE_CLOSED:
            t = (time - this.stateStartTime) / this.closedMotionMsec;
            if (t >= 1) {
                this.eyeState = EYE_STATE.STATE_OPENING;
                this.stateStartTime = time;
            }
            eyeParamValue = 0;
            break;
        case EYE_STATE.STATE_OPENING:
            t = (time - this.stateStartTime) / this.openingMotionMsec;
            if (t >= 1) {
                t = 1;
                this.eyeState = EYE_STATE.STATE_INTERVAL;
                this.nextBlinkTime = this.calcNextBlink();
            }
            eyeParamValue = t;
            break;
        case EYE_STATE.STATE_INTERVAL:
            if (this.nextBlinkTime < time) {
                this.eyeState = EYE_STATE.STATE_CLOSING;
                this.stateStartTime = time;
            }
            eyeParamValue = 1;
            break;
        case EYE_STATE.STATE_FIRST:
        default:
            this.eyeState = EYE_STATE.STATE_INTERVAL;
            this.nextBlinkTime = this.calcNextBlink();
            eyeParamValue = 1;
            break;
    }
    if (!this.closeIfZero) eyeParamValue = -eyeParamValue;
    model.setParamFloat(this.eyeID_L, eyeParamValue);
    model.setParamFloat(this.eyeID_R, eyeParamValue);
};

//== enum EYE_STATE ==
var EYE_STATE = function() {};

EYE_STATE.STATE_FIRST = 'STATE_FIRST';
EYE_STATE.STATE_INTERVAL = 'STATE_INTERVAL';
EYE_STATE.STATE_CLOSING = 'STATE_CLOSING';
EYE_STATE.STATE_CLOSED = 'STATE_CLOSED';
EYE_STATE.STATE_OPENING = 'STATE_OPENING';

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DMatrix44
//============================================================
//============================================================
function L2DMatrix44() {
    this.tr = new Float32Array(16); //
    this.identity();
}

L2DMatrix44.mul = function(a /*float[]*/, b /*float[]*/, dst /*float[]*/) {
    var c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var n = 4;
    var i, j, k;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            for (k = 0; k < n; k++) {
                c[i + j * 4] += a[i + k * 4] * b[k + j * 4];
            }
        }
    }
    for (i = 0; i < 16; i++) {
        dst[i] = c[i];
    }
};

L2DMatrix44.prototype.identity = function() {
    for (var i /*:int*/ = 0; i < 16; i++) this.tr[i] = i % 5 == 0 ? 1 : 0;
};

L2DMatrix44.prototype.getArray = function() {
    return this.tr;
};

L2DMatrix44.prototype.getCopyMatrix = function() {
    return new Float32Array(this.tr); // this.tr.clone();
};

L2DMatrix44.prototype.setMatrix = function(tr /*float[]*/) {
    if (this.tr == null || this.tr.length != this.tr.length) return;
    for (var i /*:int*/ = 0; i < 16; i++) this.tr[i] = tr[i];
};

L2DMatrix44.prototype.getScaleX = function() {
    return this.tr[0];
};

L2DMatrix44.prototype.getScaleY = function() {
    return this.tr[5];
};

L2DMatrix44.prototype.transformX = function(src /*float*/) {
    return this.tr[0] * src + this.tr[12];
};

L2DMatrix44.prototype.transformY = function(src /*float*/) {
    return this.tr[5] * src + this.tr[13];
};

L2DMatrix44.prototype.invertTransformX = function(src /*float*/) {
    return (src - this.tr[12]) / this.tr[0];
};

L2DMatrix44.prototype.invertTransformY = function(src /*float*/) {
    return (src - this.tr[13]) / this.tr[5];
};

L2DMatrix44.prototype.multTranslate = function(shiftX /*float*/, shiftY /*float*/) {
    var tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
    L2DMatrix44.mul(tr1, this.tr, this.tr);
};

L2DMatrix44.prototype.translate = function(x /*float*/, y /*float*/) {
    this.tr[12] = x;
    this.tr[13] = y;
};

L2DMatrix44.prototype.translateX = function(x /*float*/) {
    this.tr[12] = x;
};

L2DMatrix44.prototype.translateY = function(y /*float*/) {
    this.tr[13] = y;
};

L2DMatrix44.prototype.multScale = function(scaleX /*float*/, scaleY /*float*/) {
    var tr1 = [scaleX, 0, 0, 0, 0, scaleY, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    L2DMatrix44.mul(tr1, this.tr, this.tr);
};

L2DMatrix44.prototype.scale = function(scaleX /*float*/, scaleY /*float*/) {
    this.tr[0] = scaleX;
    this.tr[5] = scaleY;
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DModelMatrix       extends     L2DMatrix44
//============================================================
//============================================================
function L2DModelMatrix(w /*float*/, h /*float*/) {
    L2DMatrix44.prototype.constructor.call(this);
    this.width = w;
    this.height = h;
}

//L2DModelMatrix extends L2DMatrix44
L2DModelMatrix.prototype = new L2DMatrix44();

L2DModelMatrix.prototype.setPosition = function(x /*float*/, y /*float*/) {
    this.translate(x, y);
};

L2DModelMatrix.prototype.setCenterPosition = function(x /*float*/, y /*float*/) {
    var w = this.width * this.getScaleX();
    var h = this.height * this.getScaleY();
    this.translate(x - w / 2, y - h / 2);
};

L2DModelMatrix.prototype.top = function(y /*float*/) {
    this.setY(y);
};

L2DModelMatrix.prototype.bottom = function(y /*float*/) {
    var h = this.height * this.getScaleY();
    this.translateY(y - h);
};

L2DModelMatrix.prototype.left = function(x /*float*/) {
    this.setX(x);
};

L2DModelMatrix.prototype.right = function(x /*float*/) {
    var w = this.width * this.getScaleX();
    this.translateX(x - w);
};

L2DModelMatrix.prototype.centerX = function(x /*float*/) {
    var w = this.width * this.getScaleX();
    this.translateX(x - w / 2);
};

L2DModelMatrix.prototype.centerY = function(y /*float*/) {
    var h = this.height * this.getScaleY();
    this.translateY(y - h / 2);
};

L2DModelMatrix.prototype.setX = function(x /*float*/) {
    this.translateX(x);
};

L2DModelMatrix.prototype.setY = function(y /*float*/) {
    this.translateY(y);
};

L2DModelMatrix.prototype.setHeight = function(h /*float*/) {
    var scaleX = h / this.height;
    var scaleY = -scaleX;
    this.scale(scaleX, scaleY);
};

L2DModelMatrix.prototype.setWidth = function(w /*float*/) {
    var scaleX = w / this.width;
    var scaleY = -scaleX;
    this.scale(scaleX, scaleY);
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DMotionManager     extends     MotionQueueManager
//============================================================
//============================================================
function L2DMotionManager() {
    MotionQueueManager.prototype.constructor.call(this);
    this.currentPriority = null;
    this.reservePriority = null;

    this.super = MotionQueueManager.prototype;
}

L2DMotionManager.prototype = new MotionQueueManager();

L2DMotionManager.prototype.getCurrentPriority = function() {
    return this.currentPriority;
};

L2DMotionManager.prototype.getReservePriority = function() {
    return this.reservePriority;
};

L2DMotionManager.prototype.reserveMotion = function(priority /*int*/) {
    if (this.reservePriority >= priority) {
        return false;
    }
    if (this.currentPriority >= priority) {
        return false;
    }

    this.reservePriority = priority;

    return true;
};

L2DMotionManager.prototype.setReservePriority = function(val /*int*/) {
    this.reservePriority = val;
};

L2DMotionManager.prototype.updateParam = function(model /*ALive2DModel*/) {
    var updated = MotionQueueManager.prototype.updateParam.call(this, model);

    if (this.isFinished()) {
        this.currentPriority = 0;
    }

    return updated;
};

L2DMotionManager.prototype.startMotionPrio = function(motion /*AMotion*/, priority /*int*/) {
    if (priority == this.reservePriority) {
        this.reservePriority = 0;
    }
    this.currentPriority = priority;
    return this.startMotion(motion, false);
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DPhysics
//============================================================
//============================================================
function L2DPhysics() {
    this.physicsList = []; //ArrayList<PhysicsHair>
    this.startTimeMSec = UtSystem.getUserTimeMSec();
}

L2DPhysics.load = function(buf /*byte[]*/) {
    var ret = new L2DPhysics(); //L2DPhysicsL2DPhysics
    var pm = Live2DFramework.getPlatformManager();
    var json = pm.jsonParseFromBytes(buf);
    var params = json.physics_hair;
    var paramNum = params.length;
    for (var i = 0; i < paramNum; i++) {
        var param = params[i]; //Value
        var physics = new PhysicsHair(); //PhysicsHairPhysicsHair
        var setup = param.setup; //Value
        var length = parseFloat(setup.length);
        var resist = parseFloat(setup.regist);
        var mass = parseFloat(setup.mass);
        physics.setup(length, resist, mass);
        var srcList = param.src; //Value
        var srcNum = srcList.length;
        for (var j = 0; j < srcNum; j++) {
            var src = srcList[j]; //Value
            var id = src.id; //String
            var type = PhysicsHair.Src.SRC_TO_X;
            var typeStr = src.ptype; //String
            if (typeStr === 'x') {
                type = PhysicsHair.Src.SRC_TO_X;
            } else if (typeStr === 'y') {
                type = PhysicsHair.Src.SRC_TO_Y;
            } else if (typeStr === 'angle') {
                type = PhysicsHair.Src.SRC_TO_G_ANGLE;
            } else {
                UtDebug.error('live2d', 'Invalid parameter:PhysicsHair.Src');
            }
            var scale = parseFloat(src.scale);
            var weight = parseFloat(src.weight);
            physics.addSrcParam(type, id, scale, weight);
        }
        var targetList = param.targets; //Value
        var targetNum = targetList.length;
        for (var j = 0; j < targetNum; j++) {
            var target = targetList[j]; //Value
            var id = target.id; //String
            var type = PhysicsHair.Target.TARGET_FROM_ANGLE;
            var typeStr = target.ptype; //String
            if (typeStr === 'angle') {
                type = PhysicsHair.Target.TARGET_FROM_ANGLE;
            } else if (typeStr === 'angle_v') {
                type = PhysicsHair.Target.TARGET_FROM_ANGLE_V;
            } else {
                UtDebug.error('live2d', 'Invalid parameter:PhysicsHair.Target');
            }
            var scale = parseFloat(target.scale);
            var weight = parseFloat(target.weight);
            physics.addTargetParam(type, id, scale, weight);
        }
        ret.physicsList.push(physics);
    }
    return ret;
};

L2DPhysics.prototype.updateParam = function(model /*ALive2DModel*/) {
    var timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
    for (var i = 0; i < this.physicsList.length; i++) {
        this.physicsList[i].update(model, timeMSec);
    }
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DPose
//============================================================
//============================================================
function L2DPose() {
    this.lastTime = 0;
    this.lastModel = null; //ALive2DModel
    this.partsGroups = []; //ArrayList<L2DPartsParam[]>
}

L2DPose.load = function(buf /*byte[]*/) {
    var ret = new L2DPose(); //L2DPose
    var pm = Live2DFramework.getPlatformManager();
    var json = pm.jsonParseFromBytes(buf);
    var poseListInfo = json.parts_visible; //Value
    var poseNum = poseListInfo.length;
    for (var i_pose = 0; i_pose < poseNum; i_pose++) {
        var poseInfo = poseListInfo[i_pose]; //Value
        var idListInfo = poseInfo.group; //Value
        var idNum = idListInfo.length;
        var partsGroup /*L2DPartsParam*/ = [];
        for (var i_group = 0; i_group < idNum; i_group++) {
            var partsInfo = idListInfo[i_group]; //Value
            var parts = new L2DPartsParam(partsInfo.id); //L2DPartsParamL2DPartsParam
            partsGroup[i_group] = parts;
            if (partsInfo.link == null) continue;
            var linkListInfo = partsInfo.link; //Value
            var linkNum = linkListInfo.length;
            parts.link = []; //ArrayList<L2DPartsParam>
            for (var i_link = 0; i_link < linkNum; i_link++) {
                var linkParts = new L2DPartsParam(linkListInfo[i_link]); //L2DPartsParamL2DPartsParam
                parts.link.push(linkParts);
            }
        }
        ret.partsGroups.push(partsGroup);
    }

    return ret;
};

L2DPose.prototype.updateParam = function(model /*ALive2DModel*/) {
    if (model == null) return;

    if (!(model == this.lastModel)) {
        this.initParam(model);
    }
    this.lastModel = model;

    var curTime = UtSystem.getUserTimeMSec();
    var deltaTimeSec = this.lastTime == 0 ? 0 : (curTime - this.lastTime) / 1000.0;
    this.lastTime = curTime;
    if (deltaTimeSec < 0) deltaTimeSec = 0;
    for (var i = 0; i < this.partsGroups.length; i++) {
        this.normalizePartsOpacityGroup(model, this.partsGroups[i], deltaTimeSec);
        this.copyOpacityOtherParts(model, this.partsGroups[i]);
    }
};

L2DPose.prototype.initParam = function(model /*ALive2DModel*/) {
    if (model == null) return;
    for (var i = 0; i < this.partsGroups.length; i++) {
        var partsGroup = this.partsGroups[i]; //L2DPartsParam
        for (var j = 0; j < partsGroup.length; j++) {
            partsGroup[j].initIndex(model);
            var partsIndex = partsGroup[j].partsIndex;
            var paramIndex = partsGroup[j].paramIndex;
            if (partsIndex < 0) continue;
            var v /*:Boolean*/ = model.getParamFloat(paramIndex) != 0;
            model.setPartsOpacity(partsIndex, v ? 1.0 : 0.0);
            model.setParamFloat(paramIndex, v ? 1.0 : 0.0);
            if (partsGroup[j].link == null) continue;
            for (var k = 0; k < partsGroup[j].link.length; k++) {
                partsGroup[j].link[k].initIndex(model);
            }
        }
    }
};

L2DPose.prototype.normalizePartsOpacityGroup = function(
    model /*ALive2DModel*/,
    partsGroup /*L2DPartsParam[]*/,
    deltaTimeSec /*float*/,
) {
    var visibleParts = -1;
    var visibleOpacity = 1.0;
    var CLEAR_TIME_SEC = 0.5;
    var phi = 0.5;
    var maxBackOpacity = 0.15;
    for (var i = 0; i < partsGroup.length; i++) {
        var partsIndex = partsGroup[i].partsIndex;
        var paramIndex = partsGroup[i].paramIndex;
        if (partsIndex < 0) continue;
        if (model.getParamFloat(paramIndex) != 0) {
            if (visibleParts >= 0) {
                break;
            }
            visibleParts = i;
            visibleOpacity = model.getPartsOpacity(partsIndex);
            visibleOpacity += deltaTimeSec / CLEAR_TIME_SEC;
            if (visibleOpacity > 1) {
                visibleOpacity = 1;
            }
        }
    }
    if (visibleParts < 0) {
        visibleParts = 0;
        visibleOpacity = 1;
    }
    for (var i = 0; i < partsGroup.length; i++) {
        var partsIndex = partsGroup[i].partsIndex;
        if (partsIndex < 0) continue;
        if (visibleParts == i) {
            model.setPartsOpacity(partsIndex, visibleOpacity);
        } else {
            var opacity = model.getPartsOpacity(partsIndex);
            var a1;
            if (visibleOpacity < phi) {
                a1 = (visibleOpacity * (phi - 1)) / phi + 1;
            } else {
                a1 = ((1 - visibleOpacity) * phi) / (1 - phi);
            }
            var backOp = (1 - a1) * (1 - visibleOpacity);
            if (backOp > maxBackOpacity) {
                a1 = 1 - maxBackOpacity / (1 - visibleOpacity);
            }
            if (opacity > a1) {
                opacity = a1;
            }
            model.setPartsOpacity(partsIndex, opacity);
        }
    }
};

L2DPose.prototype.copyOpacityOtherParts = function(model /*ALive2DModel*/, partsGroup /*L2DPartsParam[]*/) {
    for (var i_group = 0; i_group < partsGroup.length; i_group++) {
        var partsParam = partsGroup[i_group]; //L2DPartsParam
        if (partsParam.link == null) continue;
        if (partsParam.partsIndex < 0) continue;
        var opacity = model.getPartsOpacity(partsParam.partsIndex);
        for (var i_link = 0; i_link < partsParam.link.length; i_link++) {
            var linkParts = partsParam.link[i_link]; //L2DPartsParam
            if (linkParts.partsIndex < 0) continue;
            model.setPartsOpacity(linkParts.partsIndex, opacity);
        }
    }
};

//============================================================
//============================================================
//  class L2DPartsParam
//============================================================
//============================================================
function L2DPartsParam(id /*String*/) {
    this.paramIndex = -1;
    this.partsIndex = -1;
    this.link = null; // ArrayList<L2DPartsParam>
    this.id = id;
}

L2DPartsParam.prototype.initIndex = function(model /*ALive2DModel*/) {
    this.paramIndex = model.getParamIndex('VISIBLE:' + this.id);
    this.partsIndex = model.getPartsDataIndex(PartsDataID.getID(this.id));
    model.setParamFloat(this.paramIndex, 1);
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DTargetPoint
//============================================================
//============================================================
function L2DTargetPoint() {
    this.EPSILON = 0.01; // 変化の最小値（この値以下は無視される）
    this.faceTargetX = 0;
    this.faceTargetY = 0;
    this.faceX = 0;
    this.faceY = 0;
    this.faceVX = 0;
    this.faceVY = 0;
    this.lastTimeSec = 0;
}

//============================================================
L2DTargetPoint.FRAME_RATE = 60;

L2DTargetPoint.prototype.setPoint = function(x /*float*/, y /*float*/) {
    this.faceTargetX = x;
    this.faceTargetY = y;
};

L2DTargetPoint.prototype.getX = function() {
    return this.faceX;
};

L2DTargetPoint.prototype.getY = function() {
    return this.faceY;
};

L2DTargetPoint.prototype.update = function() {
    var TIME_TO_MAX_SPEED = 0.15;
    var FACE_PARAM_MAX_V = 40.0 / 7.5;
    var MAX_V = FACE_PARAM_MAX_V / L2DTargetPoint.FRAME_RATE;
    if (this.lastTimeSec == 0) {
        this.lastTimeSec = UtSystem.getUserTimeMSec();
        return;
    }
    var curTimeSec = UtSystem.getUserTimeMSec();
    var deltaTimeWeight = ((curTimeSec - this.lastTimeSec) * L2DTargetPoint.FRAME_RATE) / 1000.0;
    this.lastTimeSec = curTimeSec;
    var FRAME_TO_MAX_SPEED = TIME_TO_MAX_SPEED * L2DTargetPoint.FRAME_RATE;
    var MAX_A = (deltaTimeWeight * MAX_V) / FRAME_TO_MAX_SPEED;
    var dx = this.faceTargetX - this.faceX;
    var dy = this.faceTargetY - this.faceY;
    // if(dx == 0 && dy == 0) return;
    if (Math.abs(dx) <= this.EPSILON && Math.abs(dy) <= this.EPSILON) return;
    var d = Math.sqrt(dx * dx + dy * dy);
    var vx = (MAX_V * dx) / d;
    var vy = (MAX_V * dy) / d;
    var ax = vx - this.faceVX;
    var ay = vy - this.faceVY;
    var a = Math.sqrt(ax * ax + ay * ay);
    if (a < -MAX_A || a > MAX_A) {
        ax *= MAX_A / a;
        ay *= MAX_A / a;
        a = MAX_A;
    }
    this.faceVX += ax;
    this.faceVY += ay;
    {
        var max_v = 0.5 * (Math.sqrt(MAX_A * MAX_A + 16 * MAX_A * d - 8 * MAX_A * d) - MAX_A);
        var cur_v = Math.sqrt(this.faceVX * this.faceVX + this.faceVY * this.faceVY);
        if (cur_v > max_v) {
            this.faceVX *= max_v / cur_v;
            this.faceVY *= max_v / cur_v;
        }
    }
    this.faceX += this.faceVX;
    this.faceY += this.faceVY;
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DViewMatrix        extends     L2DMatrix44
//============================================================
//============================================================
function L2DViewMatrix() {
    L2DMatrix44.prototype.constructor.call(this);
    this.screenLeft = null;
    this.screenRight = null;
    this.screenTop = null;
    this.screenBottom = null;
    this.maxLeft = null;
    this.maxRight = null;
    this.maxTop = null;
    this.maxBottom = null;
    this.max = Number.MAX_VALUE;
    this.min = 0;
}

L2DViewMatrix.prototype = new L2DMatrix44(); //L2DViewMatrix extends L2DMatrix44

L2DViewMatrix.prototype.getMaxScale = function() {
    return this.max;
};

L2DViewMatrix.prototype.getMinScale = function() {
    return this.min;
};

L2DViewMatrix.prototype.setMaxScale = function(v /*float*/) {
    this.max = v;
};

L2DViewMatrix.prototype.setMinScale = function(v /*float*/) {
    this.min = v;
};

L2DViewMatrix.prototype.isMaxScale = function() {
    return this.getScaleX() == this.max;
};

L2DViewMatrix.prototype.isMinScale = function() {
    return this.getScaleX() == this.min;
};

L2DViewMatrix.prototype.adjustTranslate = function(shiftX /*float*/, shiftY /*float*/) {
    if (this.tr[0] * this.maxLeft + (this.tr[12] + shiftX) > this.screenLeft)
        shiftX = this.screenLeft - this.tr[0] * this.maxLeft - this.tr[12];
    if (this.tr[0] * this.maxRight + (this.tr[12] + shiftX) < this.screenRight)
        shiftX = this.screenRight - this.tr[0] * this.maxRight - this.tr[12];
    if (this.tr[5] * this.maxTop + (this.tr[13] + shiftY) < this.screenTop)
        shiftY = this.screenTop - this.tr[5] * this.maxTop - this.tr[13];
    if (this.tr[5] * this.maxBottom + (this.tr[13] + shiftY) > this.screenBottom)
        shiftY = this.screenBottom - this.tr[5] * this.maxBottom - this.tr[13];

    var tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
    L2DMatrix44.mul(tr1, this.tr, this.tr);
};

L2DViewMatrix.prototype.adjustScale = function(cx /*float*/, cy /*float*/, scale /*float*/) {
    var targetScale = scale * this.tr[0];
    if (targetScale < this.min) {
        if (this.tr[0] > 0) scale = this.min / this.tr[0];
    } else if (targetScale > this.max) {
        if (this.tr[0] > 0) scale = this.max / this.tr[0];
    }
    var tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cx, cy, 0, 1];
    var tr2 = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var tr3 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -cx, -cy, 0, 1];
    L2DMatrix44.mul(tr3, this.tr, this.tr);
    L2DMatrix44.mul(tr2, this.tr, this.tr);
    L2DMatrix44.mul(tr1, this.tr, this.tr);
};

L2DViewMatrix.prototype.setScreenRect = function(left /*float*/, right /*float*/, bottom /*float*/, top /*float*/) {
    this.screenLeft = left;
    this.screenRight = right;
    this.screenTop = top;
    this.screenBottom = bottom;
};

L2DViewMatrix.prototype.setMaxScreenRect = function(left /*float*/, right /*float*/, bottom /*float*/, top /*float*/) {
    this.maxLeft = left;
    this.maxRight = right;
    this.maxTop = top;
    this.maxBottom = bottom;
};

L2DViewMatrix.prototype.getScreenLeft = function() {
    return this.screenLeft;
};

L2DViewMatrix.prototype.getScreenRight = function() {
    return this.screenRight;
};

L2DViewMatrix.prototype.getScreenBottom = function() {
    return this.screenBottom;
};

L2DViewMatrix.prototype.getScreenTop = function() {
    return this.screenTop;
};

L2DViewMatrix.prototype.getMaxLeft = function() {
    return this.maxLeft;
};

L2DViewMatrix.prototype.getMaxRight = function() {
    return this.maxRight;
};

L2DViewMatrix.prototype.getMaxBottom = function() {
    return this.maxBottom;
};

L2DViewMatrix.prototype.getMaxTop = function() {
    return this.maxTop;
};

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class Live2DFramework
//============================================================
//============================================================
function Live2DFramework() {}

Live2DFramework.platformManager = null;

Live2DFramework.getPlatformManager = function() {
    return Live2DFramework.platformManager;
};

Live2DFramework.setPlatformManager = function(platformManager /*IPlatformManager*/) {
    Live2DFramework.platformManager = platformManager;
};

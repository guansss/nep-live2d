
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

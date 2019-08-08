import './LAppDefine';
import './LAppLive2DManager';
import './LAppModel';
import './Live2DFramework';

var live2DMgr;

var gl = null;
var canvas = null;

var dragMgr = null;
var viewMatrix = null;
var projMatrix = null;
var deviceToScreen = null;

var drag = false;

function main() {
    init();

    setTimeout(function() {
        // Just for viewing via browser (Chrome for best compatibility)
        if (!window.wallpaperPropertyListener.hasBeenCalled) {
            window.wallpaperPropertyListener.applyGeneralProperties({ language: navigator.language.toLowerCase() });
            ajax('project.json', false, function(buf) {
                window.wallpaperPropertyListener.applyUserProperties(JSON.parse(buf).general.properties);
            });
        }
    }, 500);
}


function init() {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    startDraw();
}

function tick() {
    window.requestAnimationFrame(tick);

    if (MyTools.frameAvailable()) {
        draw();

        if (MyTools.snowUpdater !== null) MyTools.snowUpdater();

        if (MyTools.fpsEnabled) MyTools.fps();
    }
}

function startDraw() {
    tick();
}

function draw() {
    MatrixStack.reset();
    MatrixStack.loadIdentity();

    dragMgr.update();
    live2DMgr.setDrag(dragMgr.getX(), dragMgr.getY());

    gl.clear(gl.COLOR_BUFFER_BIT);

    MatrixStack.multMatrix(projMatrix.getArray());
    MatrixStack.multMatrix(viewMatrix.getArray());
    MatrixStack.push();

    for (var i = 0; i < live2DMgr.numModels(); i++) {
        var model = live2DMgr.getModel(i);

        if (model === undefined) return;

        if (model.initialized && !model.updating) {
            model.update();
            model.draw(gl);
        }
    }

    MatrixStack.pop();
}

// Old name: modelTurnHead(event) {
function modelAction(event, tap) {
    //    var rect = event.target.getBoundingClientRect();

    //    var sx = transformScreenX(event.clientX - rect.left);
    //    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX /*- rect.left*/);
    var vy = transformViewY(event.clientY /*- rect.top*/);

    if (LAppDefine.DEBUG_MOUSE_LOG)
        log('action device( x:' + event.clientX + ' y:' + event.clientY + ' ) view( x:' + vx + ' y:' + vy + ')');

    if (tap) live2DMgr.tapEvent(vx, vy);
    else dragMgr.setPoint(vx, vy);
}

function followPointer(event) {
    //    var rect = event.target.getBoundingClientRect();

    //    var sx = transformScreenX(event.clientX - rect.left);
    //    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX /*- rect.left*/);
    var vy = transformViewY(event.clientY /*- rect.top*/);

    if (LAppDefine.DEBUG_MOUSE_LOG)
        log('onMouseMove device( x:' + event.clientX + ' y:' + event.clientY + ' ) view( x:' + vx + ' y:' + vy + ')');

    dragMgr.setPoint(vx, vy);
}

function transformViewX(deviceX) {
    var screenX = deviceToScreen.transformX(deviceX);
    //    log(deviceX + ' -> ' + screenX + '+' + -viewMatrix.getArray()[12] + '*' + viewMatrix.getScaleX() + ' -> ' + viewMatrix.invertTransformX(screenX));
    return viewMatrix.invertTransformX(screenX);
}

function transformViewY(deviceY) {
    var screenY = deviceToScreen.transformY(deviceY);
    return viewMatrix.invertTransformY(screenY);
}

function getWebGLContext() {
    var NAMES = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];

    for (var i = 0; i < NAMES.length; i++) {
        try {
            var ctx = canvas.getContext(NAMES[i], { premultipliedAlpha: true });
            if (ctx) return ctx;
        } catch (e) {}
    }
    return null;
}

// Implemented myself
//function modelScaling(scale) {
//    var isMaxScale = viewMatrix.isMaxScale();
//    var isMinScale = viewMatrix.isMinScale();
//
//    viewMatrix.adjustScale(0, 0, scale);
//
//
//    if (!isMaxScale) {
//        if (viewMatrix.isMaxScale()) {
//            live2DMgr.maxScaleEvent();
//        }
//    }
//
//    if (!isMinScale) {
//        if (viewMatrix.isMinScale()) {
//            live2DMgr.minScaleEvent();
//        }
//    }
//}

// No touch events in WE
//function touchEvent(e) {
//    e.preventDefault();
//
//    var touch = e.touches[0];
//
//    if (e.type == "touchstart") {
//        if (e.touches.length == 1) modelTurnHead(touch);
//        // onClick(touch);
//
//    } else if (e.type == "touchmove") {
//        followPointer(touch);
//
//        if (e.touches.length == 2) {
//            var touch1 = e.touches[0];
//            var touch2 = e.touches[1];
//
//            var len = Math.pow(touch1.pageX - touch2.pageX, 2) + Math.pow(touch1.pageY - touch2.pageY, 2);
//            if (oldLen - len < 0) modelScaling(1.025);
//            else modelScaling(0.975);
//
//            oldLen = len;
//        }
//
//    } else if (e.type == "touchend") {
//        lookFront();
//    }
//}

// Not used
//function changeModel() {
//     var btnChange = document.getElementById("btnChange");
//     btnChange.setAttribute("disabled", "disabled");
//     btnChange.setAttribute("class", "inactive");
//     btnChange.textContent = "Now Loading...";
//     isModelShown = false;
//
//     live2DMgr.reloadFlg = true;
//     live2DMgr.count++;
//
//     live2DMgr.changeModel(gl);
// }
//
//function transformScreenX(deviceX) {
//    return deviceToScreen.transformX(deviceX);
//}
//
//function transformScreenY(deviceY) {
//    return deviceToScreen.transformY(deviceY);
//}

export default class Live2DManager {

    viewMatrix

    constructor(gl: WebGLRenderingContext) {

        var left = LAppDefine.VIEW_LOGICAL_LEFT;
        var right = LAppDefine.VIEW_LOGICAL_RIGHT;
        var bottom = -ratio;
        var top = ratio;

        viewMatrix = new L2DViewMatrix();
        viewMatrix.setScreenRect(left, right, bottom, top);
        viewMatrix.setMaxScreenRect(
            LAppDefine.VIEW_LOGICAL_MAX_LEFT,
            LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
            LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
            LAppDefine.VIEW_LOGICAL_MAX_TOP,
        );

        viewMatrix.setMaxScale(/*LAppDefine.VIEW_MAX_SCALE*/ 2);
        viewMatrix.setMinScale(/*LAppDefine.VIEW_MIN_SCALE*/ 0.01);

        projMatrix = new L2DMatrix44();

        projMatrix.translate(-l2dViewToCanvasScale * l2dViewToCanvasScale, offsetY);
        projMatrix.scale(l2dViewToCanvasScale, l2dViewToCanvasScale * (canvas.width / canvas.height));

        var horPixelsToLogical = (right * 2) / (innerWidth - MyTools.canvasBaseWidth / 2);
        var verPixelsToLogical = (bottom * 2) / MyTools.canvasBaseHeight;

        deviceToScreen = new L2DMatrix44();
        deviceToScreen.translate(
            -(innerWidth - MyTools.canvasBaseWidth / 2),
            -(innerHeight - MyTools.canvasBaseHeight / 2),
        );
        deviceToScreen.multScale(horPixelsToLogical, verPixelsToLogical);

        gl = getWebGLContext();
        if (!gl) {
            error('Failed to create WebGL context.');
            return;
        }

        Live2D.setGL(gl);
    }
}
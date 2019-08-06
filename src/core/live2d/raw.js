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

//============================================================
//============================================================
//  class L2DViewMatrix        extends     L2DMatrix44
//============================================================
//============================================================
function L2DViewMatrix() {
    L2DMatrix44.prototype.constructor.call(this);

}

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

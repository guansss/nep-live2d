function ModelSettingJson() {
    this.NAME = 'name';
    this.ID = 'id';
    this.MODEL = 'model';
    this.TEXTURES = 'textures';
    this.HIT_AREAS = 'hit_areas';
    this.PHYSICS = 'physics';
    this.POSE = 'pose';
    this.EXPRESSIONS = 'expressions';
    this.MOTION_GROUPS = 'motions';
    this.SOUND = 'sound';
    this.SUBTITLE = 'subtitle';
    this.TIME = 'time';
    this.FADE_IN = 'fade_in';
    this.FADE_OUT = 'fade_out';
    this.LAYOUT = 'layout';
    this.INIT_PARAM = 'init_param';
    this.INIT_PARTS_VISIBLE = 'init_parts_visible';
    this.VALUE = 'val';
    this.FILE = 'file';

    this.json = {};
}

ModelSettingJson.prototype.loadModelSetting = function(path, callback) {
    var thisRef = this;
    var pm = Live2DFramework.getPlatformManager();
    pm.loadBytes(path, function(buf) {
        var str = String.fromCharCode.apply(undefined, new Uint8Array(buf));
        thisRef.json = JSON.parse(str);
        callback();
    });
};

ModelSettingJson.prototype.getTextureFile = function(n) {
    if (this.json[this.TEXTURES] === undefined || this.json[this.TEXTURES][n] === undefined) return undefined;

    return this.json[this.TEXTURES][n];
};

ModelSettingJson.prototype.getModelFile = function() {
    return this.json[this.MODEL];
};

ModelSettingJson.prototype.getTextureNum = function() {
    if (this.json[this.TEXTURES] === undefined) return 0;

    return this.json[this.TEXTURES].length;
};

ModelSettingJson.prototype.getHitAreaNum = function() {
    if (this.json[this.HIT_AREAS] === undefined) return 0;

    return this.json[this.HIT_AREAS].length;
};

ModelSettingJson.prototype.getHitAreaID = function(n) {
    if (this.json[this.HIT_AREAS] === undefined || this.json[this.HIT_AREAS][n] === undefined) return undefined;

    return this.json[this.HIT_AREAS][n][this.ID];
};

ModelSettingJson.prototype.getHitAreaName = function(n) {
    if (this.json[this.HIT_AREAS] === undefined || this.json[this.HIT_AREAS][n] === undefined) return undefined;

    return this.json[this.HIT_AREAS][n][this.NAME];
};

ModelSettingJson.prototype.getPhysicsFile = function() {
    return this.json[this.PHYSICS];
};

ModelSettingJson.prototype.getPoseFile = function() {
    return this.json[this.POSE];
};

ModelSettingJson.prototype.getSubtitleFile = function() {
    return this.json[this.SUBTITLE];
};

ModelSettingJson.prototype.getExpressionNum = function() {
    return this.json[this.EXPRESSIONS] === undefined ? 0 : this.json[this.EXPRESSIONS].length;
};

ModelSettingJson.prototype.getExpressionFile = function(n) {
    if (this.json[this.EXPRESSIONS] === undefined) return undefined;
    return this.json[this.EXPRESSIONS][n][this.FILE];
};

ModelSettingJson.prototype.getExpressionName = function(n) {
    if (this.json[this.EXPRESSIONS] === undefined) return undefined;
    return this.json[this.EXPRESSIONS][n][this.NAME];
};

ModelSettingJson.prototype.getLayout = function() {
    return this.json[this.LAYOUT];
};

ModelSettingJson.prototype.getInitParamNum = function() {
    return this.json[this.INIT_PARAM] === undefined ? 0 : this.json[this.INIT_PARAM].length;
};

ModelSettingJson.prototype.getMotions = function(name) {
    if (this.json[this.MOTION_GROUPS] === undefined) return undefined;

    return this.json[this.MOTION_GROUPS][name];
};

ModelSettingJson.prototype.getMotionFile = function(name, n) {
    if (
        this.json[this.MOTION_GROUPS] === undefined ||
        this.json[this.MOTION_GROUPS][name] === undefined ||
        this.json[this.MOTION_GROUPS][name][n] === undefined
    )
        return undefined;

    return this.json[this.MOTION_GROUPS][name][n][this.FILE];
};

ModelSettingJson.prototype.getMotionSound = function(name, n) {
    if (
        this.json[this.MOTION_GROUPS] === undefined ||
        this.json[this.MOTION_GROUPS][name] === undefined ||
        this.json[this.MOTION_GROUPS][name][n] === undefined ||
        this.json[this.MOTION_GROUPS][name][n][this.SOUND] === undefined
    )
        return undefined;

    return this.json[this.MOTION_GROUPS][name][n][this.SOUND];
};

ModelSettingJson.prototype.getMotionTime = function(name, n) {
    if (
        this.json[this.MOTION_GROUPS] === undefined ||
        this.json[this.MOTION_GROUPS][name] === undefined ||
        this.json[this.MOTION_GROUPS][name][n] === undefined ||
        this.json[this.MOTION_GROUPS][name][n][this.TIME] === undefined
    )
        return undefined;

    return this.json[this.MOTION_GROUPS][name][n][this.TIME];
};

ModelSettingJson.prototype.getMotionSubtitle = function(name, n) {
    if (
        this.json[this.MOTION_GROUPS] === undefined ||
        this.json[this.MOTION_GROUPS][name] === undefined ||
        this.json[this.MOTION_GROUPS][name][n] === undefined ||
        this.json[this.MOTION_GROUPS][name][n][this.SUBTITLE] === undefined
    )
        return undefined;

    return this.json[this.MOTION_GROUPS][name][n][this.SUBTITLE];
};

ModelSettingJson.prototype.getMotionFadeIn = function(name, n) {
    if (
        this.json[this.MOTION_GROUPS] === undefined ||
        this.json[this.MOTION_GROUPS][name] === undefined ||
        this.json[this.MOTION_GROUPS][name][n] === undefined ||
        this.json[this.MOTION_GROUPS][name][n][this.FADE_IN] === undefined
    )
        return 500;

    return this.json[this.MOTION_GROUPS][name][n][this.FADE_IN];
};

ModelSettingJson.prototype.getMotionFadeOut = function(name, n) {
    if (
        this.json[this.MOTION_GROUPS] === undefined ||
        this.json[this.MOTION_GROUPS][name] === undefined ||
        this.json[this.MOTION_GROUPS][name][n] === undefined ||
        this.json[this.MOTION_GROUPS][name][n][this.FADE_OUT] === undefined
    )
        return 500;

    return this.json[this.MOTION_GROUPS][name][n][this.FADE_OUT];
};

ModelSettingJson.prototype.getInitParamID = function(n) {
    if (this.json[this.INIT_PARAM] === undefined || this.json[this.INIT_PARAM][n] === undefined) return undefined;

    return this.json[this.INIT_PARAM][n][this.ID];
};

ModelSettingJson.prototype.getInitParamValue = function(n) {
    if (this.json[this.INIT_PARAM] === undefined || this.json[this.INIT_PARAM][n] === undefined) return NaN;

    return this.json[this.INIT_PARAM][n][this.VALUE];
};

ModelSettingJson.prototype.getInitPartsVisibleNum = function() {
    return this.json[this.INIT_PARTS_VISIBLE] === undefined ? 0 : this.json[this.INIT_PARTS_VISIBLE].length;
};

ModelSettingJson.prototype.getInitPartsVisibleID = function(n) {
    if (this.json[this.INIT_PARTS_VISIBLE] === undefined || this.json[this.INIT_PARTS_VISIBLE][n] === undefined)
        return undefined;
    return this.json[this.INIT_PARTS_VISIBLE][n][this.ID];
};

ModelSettingJson.prototype.getInitPartsVisibleValue = function(n) {
    if (this.json[this.INIT_PARTS_VISIBLE] === undefined || this.json[this.INIT_PARTS_VISIBLE][n] === undefined)
        return NaN;

    return this.json[this.INIT_PARTS_VISIBLE][n][this.VALUE];
};

import Live2DPhysics from '@/core/live2d/Live2DPhysics';
import ModelSettings from '@/core/live2d/ModelSettings';
import { log, Tagged } from '@/core/utils/log';
import { getArrayBuffer, getJSON } from '@/core/utils/net';
import { dirname } from 'path';
import { parse as urlParse } from 'url';

const logSender = { tag: 'Live2DLoader' } as Tagged;

export async function loadModelSettings(file?: string) {
    if (!file) throw 'Missing model settings file';

    log(logSender, `Loading model settings:`, file);

    const url = urlParse(file);
    const baseDir = dirname(url.pathname);
    const json = await getJSON(file);

    return new ModelSettings(json, baseDir);
}

export async function loadModel(file?: string) {
    if (!file) throw 'Missing model file';

    log(logSender, `Loading model:`, file);

    const buffer = await getArrayBuffer(file);
    const model = Live2DModelWebGL.loadModel(buffer);

    const error = Live2D.getError();
    if (error) throw error;

    return model;
}

export async function loadTexture(file?: string, gl: WebGLRenderingContext) {
    if (!file) throw 'Missing texture file';

    log(logSender, 'Loading texture:', file || '(missing)');

    const image = new Image();
    image.src = file;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    const texture = gl.createTexture();
    if (!texture) throw 'Failed to create texture using WebGL';

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

    return texture;
}

export async function loadPose(file?: string) {
    if (!file) throw 'Missing pose file';

    log(logSender, 'Loading pose:', file);

    const buffer = await getArrayBuffer(file);
    return L2DPose.load(buffer);
}

export async function loadPhysics(file: string, internalModel: Live2DModelWebGL) {
    log(logSender, 'Loading physics:', file);

    const json = await getJSON(file);
    return new Live2DPhysics(internalModel!, json);
}

export async function loadSubtitle(file?: string) {
    if (!file) throw 'Missing subtitle file';

    log(logSender, 'Loading subtitle:', file);

    return await getJSON(file);
}

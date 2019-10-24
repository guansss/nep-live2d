import { LIVE2D_DIRECTORY } from '@/defaults';
import Live2DSprite from '@/module/live2d/Live2DSprite';

export interface ModelConfig {
    readonly id: number;
    readonly path: string;
    readonly internal?: boolean;
    enabled?: boolean;
    scale?: number;
    x?: number;
    y?: number;
    preview?: string;
}

export const DEFAULT_MODEL_CONFIG: Omit<ModelConfig, 'id' | 'path'> = {
    enabled: true,
    scale: 1 / innerHeight,
    x: 0.5,
    y: 0.5,
};

export function toStorageValues<T extends Partial<ModelConfig>>(config: T): T {
    const _config = Object.assign({}, config);

    if (_config.scale !== undefined) _config.scale /= innerHeight;
    if (_config.x !== undefined) _config.x /= innerWidth;
    if (_config.y !== undefined) _config.y /= innerHeight;

    return _config;
}

export function toActualValues<T extends Partial<ModelConfig>>(config: T): T {
    const _config = Object.assign({}, config);

    if (_config.scale !== undefined) _config.scale *= innerHeight;
    if (_config.x !== undefined) _config.x *= innerWidth;
    if (_config.y !== undefined) _config.y *= innerHeight;

    return _config;
}

export function configureSprite(sprite: Live2DSprite, config: Partial<ModelConfig>) {
    const _config = toActualValues(config);

    if (!isNaN(_config.scale!)) {
        const oldWidth = sprite.width;
        const oldHeight = sprite.height;

        sprite.scale.x = sprite.scale.y = _config.scale!;

        sprite.x -= (sprite.width - oldWidth) / 2;
        sprite.y -= (sprite.height - oldHeight) / 2;
    }

    if (!isNaN(_config.x!)) sprite.x = _config.x! - sprite.width / 2;
    if (!isNaN(_config.y!)) sprite.y = _config.y! - sprite.height / 2;
}

/**
 * Makes a Live2D model path using the name of its model settings file.
 *
 * @example
 * // while LIVE2D_DIRECTORY = 'live2d'
 * makeModelPath('neptune.model.json')
 * => 'live2d/neptune/neptune.model.json'
 */
export function makeModelPath(fileName: string) {
    const separatorIndex = fileName.indexOf('.');
    const dir = fileName.slice(0, separatorIndex > 0 ? separatorIndex : undefined);
    return `${LIVE2D_DIRECTORY}/${dir}/${fileName}`;
}

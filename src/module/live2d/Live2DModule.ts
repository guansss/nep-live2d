import { App, Module } from '@/App';
import Live2DModel from '@/core/live2d/Live2DModel';
import { error } from '@/core/utils/log';
import defaults from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import Live2DPlayer from '@/module/live2d/Live2DPlayer';
import Live2DSprite from '@/module/live2d/Live2DSprite';

export interface App {
    emit(event: 'live2dDraggable', draggable: boolean): this;

    emit(event: 'live2dAdd', path: string, callback?: (error?: Error, model?: Live2DModel) => void): this;

    emit(event: 'live2dRemove', uid: number): this;

    emit(event: 'live2dLoaded', model: Live2DModel): this;

    emit(event: 'live2dConfig', uid: number, config: Partial<ModelConfig>): this;
}

export interface ModelConfig {
    readonly uid: number;
    readonly path: string;
    readonly builtIn?: boolean;
    enabled?: boolean;
    scale?: number;
    x?: number;
    y?: number;
}

export function toStorageFormat(config: Partial<ModelConfig>) {
    const _config = Object.assign({}, config);

    if (_config.scale !== undefined) _config.scale /= innerHeight;
    if (_config.x !== undefined) _config.x /= innerWidth;
    if (_config.y !== undefined) _config.y /= innerHeight;

    return _config;
}

export function toRuntimeFormat(config: Partial<ModelConfig>) {
    const _config = Object.assign({}, config);

    if (_config.scale !== undefined) _config.scale *= innerHeight;
    if (_config.x !== undefined) _config.x *= innerWidth;
    if (_config.y !== undefined) _config.y *= innerHeight;

    return _config;
}

function configureSprite(sprite: Live2DSprite, config: ModelConfig) {
    const _config = toRuntimeFormat(config);

    if (!isNaN(_config.scale!)) {
        const oldWidth = sprite.width;
        const oldHeight = sprite.height;

        sprite.scale.x = sprite.scale.y = _config.scale!;

        sprite.x -= (sprite.width - oldWidth) / 2;
        sprite.y -= (sprite.height - oldHeight) / 2;
    }

    // TODO: use safe area rather than size of entire client
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
    return `${defaults.LIVE2D_DIRECTORY}/${dir}/${fileName}`;
}

const TAG = 'Live2DModule';

export default class Live2DModule implements Module {
    name = 'Live2D';

    player: Live2DPlayer;

    config?: Config;

    get builtInModelConfigs() {
        return (this.config ? this.config.get('live2d.builtIns', []) : []) as ModelConfig[];
    }

    get savedModelConfigs() {
        return (this.config ? this.config.get('live2d.models', []) : []) as ModelConfig[];
    }

    constructor(readonly app: App) {
        this.player = new Live2DPlayer(app.mka!);
        this.player.dragEnded = sprite => this.savePosition(sprite);

        app.mka!.addPlayer('live2d', this.player);

        app.on('configReady', (config: Config) => {
                this.config = config;
                this.loadBuiltInModels();
                this.loadSavedModels();
            })
            .on('config:live2d.draggable', (draggable: boolean) => (this.player.mouseHandler.draggable = draggable))
            .on('live2dConfig', this.configureModel, this)
            .on('live2dAdd', this.addModel, this)
            .on('live2dRemove', this.removeModel, this);
    }

    private loadBuiltInModels() {
        const builtInModelConfigs: ModelConfig[] = [];

        defaults.LIVE2D_MODELS.forEach(async (file, index) => {
            try {
                const config = {
                    uid: -index, // use negative index as UID, this is special for built-in models
                    path: makeModelPath(file),
                    builtIn: true,
                    enabled: true,

                    // TODO: don't make these hardcoded
                    scale: 0.0004,
                    x: 0.5,
                    y: 0.7,
                };

                // save it to runtime config
                builtInModelConfigs.push(config);
                this.app.sticky('config', 'live2d.builtIns', builtInModelConfigs, true);

                // find saved user config by the built-in flag and path, instead of UID
                let savedConfig = this.savedModelConfigs.find(it => it.builtIn && it.path === config.path);

                if (savedConfig) {
                    // update saved UID so we can find it by UID in this launch
                    (savedConfig as any).uid = config.uid;
                } else {
                    // create an empty ModelConfig for built-in models
                    savedConfig = { uid: config.uid, path: config.path, builtIn: true };

                    const savedModelConfigs = this.savedModelConfigs;
                    savedModelConfigs.push(savedConfig);
                    this.app.sticky('config', 'live2d.models', savedModelConfigs);
                }

                if (!(savedConfig && savedConfig.enabled === false)) {
                    await this.loadModel(config.path, config.uid, sprite => {
                        configureSprite(sprite, Object.assign({}, config, savedConfig));
                    });
                }
            } catch (e) {
                error(TAG, e);
            }
        });
    }

    private loadSavedModels() {
        this.savedModelConfigs.forEach(async modelConfig => {
            if (!modelConfig.builtIn && modelConfig.enabled) {
                this.loadModel(modelConfig.path, modelConfig.uid, sprite => configureSprite(sprite, modelConfig)).catch(
                    e => error(TAG, e),
                );
            }
        });
    }

    private async loadModel(path: string, uid?: number, callback?: (sprite: Live2DSprite) => void) {
        const sprite = await this.player.addSprite(path, uid);

        // can do some work before emitting the event
        callback && callback(sprite);

        this.app.emit('live2dLoaded', sprite.model);
    }

    private async addModel(
        path: string,
        callback?: (error?: Error, model?: Live2DModel, config?: ModelConfig) => void,
    ) {
        try {
            await this.loadModel(path, undefined, sprite => {
                // save the model if not been saved
                const modelConfigs = this.savedModelConfigs;
                let modelConfig = modelConfigs.find(saved => saved.uid === sprite.model.uid);

                if (!modelConfig) {
                    modelConfig = { uid: sprite.model.uid, path, enabled: true };
                    modelConfigs.push(modelConfig);
                    this.app.emit('config', 'live2d.models', modelConfigs);
                }

                // call the callback before "live2dLoaded" event is emitted, otherwise there will be issues in CharacterSettings
                callback && callback(undefined, sprite.model, modelConfig);
            });
        } catch (e) {
            callback && callback(e);
        }
    }

    private removeModel(uid: number) {
        this.player.sprites.forEach(sprite => {
            if (sprite.model.uid === uid) {
                this.player.removeSprite(sprite);
            }
        });
    }

    private configureModel(uid: number, config: ModelConfig) {
        this.modifyModel(uid, modelConfig => {
            let sprite = this.player.sprites.find(sprite => sprite.model.uid === uid);

            if (sprite) {
                if (config.enabled !== false) {
                    configureSprite(sprite, config);
                } else {
                    // remove sprites whose model is disabled
                    this.player.removeSprite(sprite);
                }
            } else if (config.enabled) {
                const finalConfig = Object.assign(
                    {},
                    modelConfig.builtIn
                        ? this.builtInModelConfigs.find(builtInConfig => builtInConfig.path === modelConfig.path)
                        : undefined,
                    modelConfig,
                    config,
                );

                this.loadModel(modelConfig.path, modelConfig.uid, sprite => configureSprite(sprite, finalConfig)).catch(
                    e => error(TAG, e),
                );
            }

            Object.assign(modelConfig, config);
        });
    }

    private savePosition(sprite: Live2DSprite) {
        this.modifyModel(sprite.model.uid, modelConfig => {
            Object.assign(
                modelConfig,
                toStorageFormat({
                    x: sprite.x + sprite.width / 2,
                    y: sprite.y + sprite.height / 2,
                }),
            );
        });
    }

    private modifyModel(uid: number, action: (modelConfig: ModelConfig) => void) {
        const modelConfigs = this.savedModelConfigs;
        const modelConfig = modelConfigs.find(saved => saved.uid === uid);

        if (modelConfig) {
            action(modelConfig);

            this.app.emit('config', 'live2d.models', modelConfigs);
        }
    }
}

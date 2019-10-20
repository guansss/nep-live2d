import { App, Module } from '@/App';
import Live2DModel from '@/core/live2d/Live2DModel';
import { error } from '@/core/utils/log';
import { Config } from '@/module/config/ConfigModule';
import Live2DPlayer from '@/module/live2d/Live2DPlayer';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { configureSprite, DEFAULT_MODEL_CONFIG, ModelConfig, toStorageValues } from '@/module/live2d/ModelConfig';

export interface App {
    emit(event: 'live2dAdd', path: string, config?: ModelConfig): this;

    emit(event: 'live2dRemove', id: number): this;

    emit(event: 'live2dLoaded', model: Live2DModel): this;

    emit(event: 'live2dConfig', id: number, config: Partial<ModelConfig>): this;
}

let _id = 1;

// update reserve ID to prevent duplication
function dedupeID(id: number) {
    _id = Math.max(_id, id + 1);
}

function generateID() {
    return _id++;
}

const TAG = 'Live2DModule';

export default class Live2DModule implements Module {
    name = 'Live2D';

    player: Live2DPlayer;

    config?: Config;

    pendingRemoveIDs: number[] = []; // a list for models which are pending to be removed

    get internalModelConfigs() {
        return this.config ? this.config.get<ModelConfig[]>('live2d.internalModels', []) : [];
    }

    get modelConfigs() {
        return this.config ? this.config.get<ModelConfig[]>('live2d.models', []) : [];
    }

    constructor(readonly app: App) {
        this.player = new Live2DPlayer(app.mka!);
        this.player.dragEnded = sprite => this.savePosition(sprite);

        app.mka!.addPlayer('live2d', this.player);

        app.on('configReady', (config: Config) => {
                this.config = config;
                this.loadSavedModels();
            })
            .on('config:live2d.draggable', (draggable: boolean) => (this.player.mouseHandler.draggable = draggable))
            .on('live2dConfig', this.configureModel, this)
            .on('live2dAdd', this.addModel, this)
            .on('live2dRemove', this.removeModel, this);
    }

    private loadSavedModels() {
        this.modelConfigs.forEach(config => {
            if (config.id !== undefined) dedupeID(config.id);

            if (!config.internal && config.enabled) {
                this.loadModel(config.path, config.id, sprite => configureSprite(sprite, config)).catch(e =>
                    error(TAG, e),
                );
            }
        });
    }

    private async loadModel(path: string, id: number, loaded?: (sprite: Live2DSprite) => void) {
        const sprite = await this.player.addSprite(path);

        if (this.pendingRemoveIDs.includes(id)) {
            this.pendingRemoveIDs.splice(this.pendingRemoveIDs.indexOf(id), 1);
            this.player.removeSprite(sprite);
            error(TAG, `Loading canceled: [${id}] ${sprite.model.name}`);
            return;
        }

        sprite.id = id;

        // prepare before emitting the event
        loaded && loaded(sprite);

        this.app.emit('live2dLoaded', id, sprite);
    }

    /**
     * Adds an internal model or a custom model.
     * @param path
     * @param config - If provided, the model will be considered an internal model, otherwise a custom model
     */
    private async addModel(path: string, config?: ModelConfig) {
        const id = generateID();

        const modelConfigs = this.modelConfigs.slice();
        let savedConfig: ModelConfig | undefined;

        if (config) {
            const internalConfigs = this.internalModelConfigs.slice();

            if (!internalConfigs.find(it => it.id === id)) {
                internalConfigs.push({ id, path, ...DEFAULT_MODEL_CONFIG, ...config });
                this.app.emit('config', 'live2d.internalModels', internalConfigs, true);
            }

            savedConfig = modelConfigs.find(it => it.internal && it.path === path);

            if (savedConfig) {
                // internal model IDs are dynamically generated, so we update saved ID every time we add an internal model
                (savedConfig as any).id = id;
            } else {
                // create a config stub for internal model
                savedConfig = { id, path, internal: true };
            }

            this.app.emit('config', 'live2d.models', modelConfigs);
        } else if (!savedConfig) {
            // create a full config for custom model
            savedConfig = { id, path, ...DEFAULT_MODEL_CONFIG };
            modelConfigs.push(savedConfig);
            this.app.emit('config', 'live2d.models', modelConfigs);
        }

        if (savedConfig.enabled === false) return;

        try {
            await this.loadModel(path, id, sprite => {
                configureSprite(sprite, Object.assign({}, config, this.modelConfigs.find(it => it.id === id)));
            });
        } catch (e) {
            error(TAG, e);
            this.app.emit('live2dError', id, e);
        }
    }

    private removeModel(id: number) {
        const configs = this.modelConfigs;

        // configs for internal models should not be removed
        const excluded = configs.filter(config => config.internal || config.id !== id);

        if (configs.length !== excluded.length) {
            this.app.emit('config', 'live2d.models', excluded);
        }

        let spriteRemoved = false;

        this.player.sprites.forEach(sprite => {
            if (sprite.id === id) {
                this.player.removeSprite(sprite);
                spriteRemoved = true;
            }
        });

        if (!spriteRemoved) {
            // remove sprite right after it finishes loading
            this.pendingRemoveIDs.push(id);
        }
    }

    private configureModel(id: number, config: Partial<ModelConfig>) {
        const updatedConfig = this.modifyModel(id, config);

        if (updatedConfig) {
            const sprite = this.player.sprites.find(sprite => sprite.id === id);

            if (updatedConfig.enabled !== false) {
                if (sprite) {
                    configureSprite(sprite, config);
                } else {
                    // create sprite when not existing but enabled
                    const finalConfig = Object.assign(
                        {},
                        updatedConfig.internal ? this.internalModelConfigs.find(it => it.id === id) : undefined,
                        updatedConfig,
                    );

                    this.loadModel(updatedConfig.path, id, sprite => configureSprite(sprite, finalConfig)).catch(e =>
                        error(TAG, e),
                    );
                }
            } else {
                if (sprite) {
                    // remove sprite when existing but not enabled
                    this.player.removeSprite(sprite);
                } else {
                    // remove sprite right after it finishes loading
                    this.pendingRemoveIDs.push(id);
                }
            }
        }
    }

    private savePosition(sprite: Live2DSprite) {
        this.modifyModel(
            sprite.id,
            toStorageValues({
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height / 2,
            }),
        );
    }

    private modifyModel(id: number, config: Partial<ModelConfig>) {
        const modelConfigs = this.modelConfigs;
        let modelConfig = modelConfigs.find(config => config.id === id);

        if (modelConfig) {
            Object.assign(modelConfig, config);

            this.app.emit('config', 'live2d.models', modelConfigs);

            return modelConfig;
        } else {
            const internalConfig = this.internalModelConfigs.find(config => config.id === id);

            if (internalConfig) {
                modelConfig = {
                    id,
                    path: internalConfig.path,
                    internal: true,
                    ...config,
                };

                this.app.emit('config', 'live2d.models', [...modelConfigs, modelConfig]);

                return modelConfig;
            }
        }
    }
}

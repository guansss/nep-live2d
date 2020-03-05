import { App, Module } from '@/App';
import { error, log } from '@/core/utils/log';
import { FOCUS_TIMEOUT, LIVE2D_DIRECTORY } from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import Live2DPlayer from '@/module/live2d/Live2DPlayer';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { DEFAULT_MODEL_CONFIG, ModelConfig, ModelConfigUtils } from '@/module/live2d/ModelConfig';
import versionLessThan from 'semver/functions/lt';
import versionValid from 'semver/functions/valid';

export interface App {
    emit(event: 'live2dAdd', path: string, config?: ModelConfig): this;

    emit(event: 'live2dRemove', id: number): this;

    emit(event: 'live2dLoaded', id: number, sprite: Live2DSprite): this;

    emit(event: 'live2dConfig', id: number, config: Partial<ModelConfig>): this;
}

let _id = 1;

function generateID() {
    return _id++;
}

const TAG = 'Live2DModule';

export default class Live2DModule implements Module {
    name = 'Live2D';

    player: Live2DPlayer;

    config?: Config;

    loadingIDs: number[] = [];
    pendingRemoveIDs: number[] = []; // a list for models which are pending to be removed

    errors: Record<number, Error | string> = {};

    get modelConfigs() {
        return this.config ? this.config.get<ModelConfig[]>('live2d.models', []) : [];
    }

    constructor(readonly app: App) {
        this.player = new Live2DPlayer(app.mka!);
        this.player.dragEnded = sprite => this.savePosition(sprite);

        app.mka.addPlayer('live2d', this.player);

        ((app.mka.pixiApp.renderer as any) as { runners: { resize: PIXI.Runner } }).runners.resize.add(this);

        app.on('init', this.migrate, this)
            .on('config:live2d.draggable', (draggable: boolean) => (this.player.mouseHandler.draggable = draggable))
            .on('config:live2d.fPress', this.player.mouseHandler.setFocusOnPress, this.player.mouseHandler)
            .on('config:live2d.fTime', this.player.mouseHandler.setLoseFocusTimeout, this.player.mouseHandler)
            .on('live2dConfig', this.configureModel, this)
            .on('live2dAdd', this.addModel, this)
            .on('live2dRemove', this.removeModel, this)
            .on('live2dRemoveAll', this.removeAllModels, this)
            .on('live2dShift', this.shiftModel, this)
            .on('configReady', (config: Config) => {
                this.config = config;

                app.emit('config', 'live2d.fPress', false, true);
                app.emit('config', 'live2d.fTime', FOCUS_TIMEOUT, true);

                this.loadSavedModels();
            });
    }

    migrate(prevVersion: string | undefined, config: Config) {
        // apply changes of config format in commit d5184febf31119458ea33e06ce41f057257c5947
        if (versionValid(prevVersion) && versionLessThan(prevVersion, '2.1.0')) {
            const models = config.get<any[]>('live2d.models', []);

            if (models.length) {
                for (const model of models) {
                    if (typeof model.file === 'string') {
                        // the "live2d/" prefix in Live2D model path had been deprecated
                        model.file = model.file.replace('live2d/', '');
                    }
                }

                this.app.emit('config', 'live2d.models', models);
            }
        }
    }

    // will be called from "resize" runner of pixiApp's renderer
    resize(width: number, height: number) {
        ModelConfigUtils.containerWidth = width;
        ModelConfigUtils.containerHeight = height;

        this.player.sprites.forEach(sprite => this.updateSprite(sprite));
    }

    updateSprite(sprite: Live2DSprite) {
        const modelConfig = this.modelConfigs.find(config => config.id === sprite.id);

        if (modelConfig) {
            ModelConfigUtils.configureSprite(sprite, modelConfig);
        }
    }

    private loadSavedModels() {
        this.modelConfigs.forEach(config => {
            // update ID
            config.id = generateID();

            if (config.enabled) {
                this.loadModel(config.file, config.id).then();
            }
        });
    }

    private async loadModel(file: string | string[], id: number, loaded?: (sprite: Live2DSprite) => void) {
        try {
            this.loadingIDs.push(id);

            if (Array.isArray(file)) {
                file = file.map(file => LIVE2D_DIRECTORY + '/' + file);
            } else {
                file = LIVE2D_DIRECTORY + '/' + file;
            }

            const sprite = await this.player.addSprite(file);

            this.loadingIDs.splice(this.loadingIDs.indexOf(id), 1);

            if (this.pendingRemoveIDs.includes(id)) {
                this.pendingRemoveIDs.splice(this.pendingRemoveIDs.indexOf(id), 1);
                this.player.removeSprite(sprite);
                log(TAG, `Loading canceled: [${id}] ${sprite.model.name}`);
                return;
            }

            sprite.id = id;

            if (sprite.model.modelSettings.preview) {
                // save the preview so we can show it without the need to load a model
                this.configureModel(id, { preview: sprite.model.modelSettings.json.preview });
            }

            this.updateSprite(sprite);

            // prepare before emitting the event
            loaded && loaded(sprite);

            this.app.emit('live2dLoaded', id, sprite);
        } catch (e) {
            error(TAG, e);
            this.errors[id] = e;
            this.app.emit('live2dError', id, e);
        }
    }

    private async addModel(file: string | string[], config?: ModelConfig) {
        const id = generateID();

        if (Array.isArray(file)) {
            const modelSettingsFile = file.find(f => f.endsWith('.model.json'));

            if (modelSettingsFile) {
                // just save the model settings file rather than all the files
                file = modelSettingsFile;
            }
        }

        const modelConfig: ModelConfig = Object.assign(
            {
                id,
                file: file,
                order: this.modelConfigs.length,
            },
            DEFAULT_MODEL_CONFIG,
            config,
        );

        this.app.emit('config', 'live2d.models', [...this.modelConfigs, modelConfig]);

        if (modelConfig.enabled) {
            await this.loadModel(file, id);
        }
    }

    private removeAllModels() {
        // use `slice()` to copy the array because it will be mutated by `removeSprite()`
        this.player.sprites.slice().forEach(sprite => this.player.removeSprite(sprite));

        this.pendingRemoveIDs = this.pendingRemoveIDs.concat(this.loadingIDs);

        this.app.emit('config', 'live2d.models', []);
    }

    private removeModel(id: number) {
        const modelConfigs = this.modelConfigs.slice();

        const removed = modelConfigs.find(config => config.id === id);

        if (removed) {
            modelConfigs.splice(modelConfigs.indexOf(removed), 1);

            // reorder models
            modelConfigs.forEach(config => {
                if (config.order > removed.order) {
                    this.configureModel(config.id, { order: config.order - 1 }).then();
                }
            });

            this.app.emit('config', 'live2d.models', modelConfigs);
        }

        this.player.sprites.forEach(sprite => {
            if (sprite.id === id) {
                this.player.removeSprite(sprite);
            }
        });

        if (this.loadingIDs.includes(id)) {
            this.pendingRemoveIDs.push(id);
        }
    }

    private shiftModel(id: number, direction: number) {
        const modelConfigs = this.modelConfigs;

        const config = modelConfigs.find(config => config.id === id);

        if (config) {
            const order = config.order;
            const targetConfig = modelConfigs.find(config => config.order === order + direction);

            if (targetConfig) {
                config.order = targetConfig.order;
                targetConfig.order = order;

                this.configureModel(id, { order: config.order }).then();
                this.configureModel(targetConfig.id, { order }).then();
            }
        }
    }

    private async configureModel(id: number, config: Partial<ModelConfig>) {
        const updatedConfig = this.modifyModel(id, config);

        if (updatedConfig) {
            const sprite = this.player.sprites.find(sprite => sprite.id === id);

            if (updatedConfig.enabled) {
                if (sprite) {
                    ModelConfigUtils.configureSprite(sprite, config);
                } else if (!this.loadingIDs.includes(id)) {
                    // create sprite if not existing
                    await this.loadModel(updatedConfig.file, id);
                }
            } else {
                if (sprite) {
                    // remove sprite if existing
                    this.player.removeSprite(sprite);
                } else if (config.enabled === false && this.loadingIDs.includes(id)) {
                    // remove sprite right after it finishes loading
                    this.pendingRemoveIDs.push(id);
                }
            }
        }
    }

    private savePosition(sprite: Live2DSprite) {
        this.modifyModel(
            sprite.id,
            ModelConfigUtils.toStorageValues({
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height / 2,
            }),
        );
    }

    private modifyModel(id: number, config: Partial<ModelConfig>) {
        const modelConfigs = this.modelConfigs;
        const modelConfig = modelConfigs.find(config => config.id === id);

        if (modelConfig) {
            Object.assign(modelConfig, config);

            this.app.emit('config', 'live2d.models', modelConfigs);

            return modelConfig;
        }
    }
}

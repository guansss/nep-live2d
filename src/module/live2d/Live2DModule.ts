import { App, Module } from '@/App';
import { error, log } from '@/core/utils/log';
import { FOCUS_TIMEOUT } from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import Live2DPlayer from '@/module/live2d/Live2DPlayer';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { configureSprite, DEFAULT_MODEL_CONFIG, ModelConfig, toStorageValues } from '@/module/live2d/ModelConfig';

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

    get modelConfigs() {
        return this.config ? this.config.get<ModelConfig[]>('live2d.models', []) : [];
    }

    constructor(readonly app: App) {
        this.player = new Live2DPlayer(app.mka!);
        this.player.dragEnded = sprite => this.savePosition(sprite);

        app.mka!.addPlayer('live2d', this.player);

        app.on('config:live2d.draggable', (draggable: boolean) => (this.player.mouseHandler.draggable = draggable))
            .on('config:live2d.fPress', this.player.mouseHandler.setFocusOnPress, this.player.mouseHandler)
            .on('config:live2d.fTime', this.player.mouseHandler.setLoseFocusTimeout, this.player.mouseHandler)
            .on('live2dConfig', this.configureModel, this)
            .on('live2dAdd', this.addModel, this)
            .on('live2dRemove', this.removeModel, this)
            .on('live2dRemoveAll', this.removeAllModels, this)
            .on('configReady', (config: Config) => {
                this.config = config;

                app.emit('config', 'live2d.fPress', false, true);
                app.emit('config', 'live2d.fTime', FOCUS_TIMEOUT, true);

                this.loadSavedModels();
            });
    }

    private loadSavedModels() {
        this.modelConfigs.forEach(async config => {
            // update ID
            config.id = generateID();

            if (config.enabled) {
                try {
                    await this.loadModel(config.file, config.id);
                } catch (e) {
                    error(TAG, e);
                }
            }
        });
    }

    private async loadModel(path: string, id: number, loaded?: (sprite: Live2DSprite) => void) {
        this.loadingIDs.push(id);

        const sprite = await this.player.addSprite(path);

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
            this.configureModel(id, { preview: sprite.model.modelSettings.preview });
        }

        const modelConfig = this.modelConfigs.find(config => config.id === id);

        if (modelConfig) {
            configureSprite(sprite, modelConfig);
        }

        // prepare before emitting the event
        loaded && loaded(sprite);

        this.app.emit('live2dLoaded', id, sprite);
    }

    private async addModel(file: string, config?: ModelConfig) {
        const id = generateID();
        const modelConfig: ModelConfig = Object.assign({ id, file }, DEFAULT_MODEL_CONFIG, config);

        this.app.emit('config', 'live2d.models', [...this.modelConfigs, modelConfig]);

        if (!modelConfig.enabled) return;

        try {
            await this.loadModel(file, id);
        } catch (e) {
            error(TAG, e);
            this.app.emit('live2dError', id, e);
        }
    }

    private removeAllModels() {
        // use `slice()` to copy the array because it will be mutated by `removeSprite()`
        this.player.sprites.slice().forEach(sprite => this.player.removeSprite(sprite));

        this.pendingRemoveIDs = this.pendingRemoveIDs.concat(this.loadingIDs);

        this.app.emit('config', 'live2d.models', []);
    }

    private removeModel(id: number) {
        const modelConfigs = this.modelConfigs;
        const excluded = modelConfigs.filter(config => config.id !== id);

        if (modelConfigs.length !== excluded.length) {
            this.app.emit('config', 'live2d.models', excluded);
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

    private async configureModel(id: number, config: Partial<ModelConfig>) {
        const updatedConfig = this.modifyModel(id, config);

        if (updatedConfig) {
            const sprite = this.player.sprites.find(sprite => sprite.id === id);

            if (updatedConfig.enabled !== false) {
                if (sprite) {
                    configureSprite(sprite, config);
                } else if (!this.loadingIDs.includes(id)) {
                    // create sprite if not existing
                    try {
                        this.loadModel(updatedConfig.file, id);
                    } catch (e) {
                        error(TAG, e);
                        this.app.emit('live2dError', id, e);
                    }
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
            toStorageValues({
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

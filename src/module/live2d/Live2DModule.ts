import { App, Module } from '@/App';
import Live2DModel from '@/core/live2d/Live2DModel';
import { error } from '@/core/utils/log';
import { Config } from '@/module/config/ConfigModule';
import Live2DPlayer from '@/module/live2d/Live2DPlayer';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import get from 'lodash/get';
import { resolve as urlResolve } from 'url';

export interface App {
    emit(event: 'live2dAdd', path: string, callback?: (error?: Error, model?: Live2DModel) => void): this;

    emit(event: 'live2dLoaded', model: Live2DModel): this;

    on(
        event: 'live2dAdd',
        fn: (path: string, callback?: (error?: Error, model?: Live2DModel) => void) => void,
        context?: any,
    ): this;

    on(event: 'live2dLoaded', fn: (model: Live2DModel) => void, context?: any): this;
}

export class SavedModel {
    enabled = true;
    scale = 1;

    constructor(readonly uid: number, readonly path: string) {}
}

const TAG = 'Live2DModule';

export default class Live2DModule implements Module {
    name = 'Live2D';

    player: Live2DPlayer;

    config?: Config;

    constructor(readonly app: App) {
        this.player = new Live2DPlayer(app.mka!);
        app.mka!.addPlayer('live2d', this.player);

        // this.loadModels();

        app.on('configInit', (config: Config) => {
                this.config = config;
                this.loadModels();
            })
            .on('config:model.models', this.modelsUpdated, this)
            .on('live2dAdd', this.addModel, this);
    }

    _loadModels() {
        const basePath = process.env.VUE_APP_LIVE2D_PATH + '/';
        const models = process.env.VUE_APP_LIVE2D_MODELS;

        if (basePath && models) {
            models.split(',').forEach(model => this.addModel(urlResolve(basePath, model)));
        }
    }

    private loadModels() {
        const savedModels = get(this.config, 'model.models', []) as SavedModel[];

        savedModels.forEach(async saved => {
            try {
                const sprite = await this.loadModel(saved.path, saved.uid);
                this.configureSprite(sprite, saved);
            } catch (e) {
                error(TAG, e);
            }
        });
    }

    private async loadModel(path: string, uid?: number, callback?: (model: Live2DModel) => void) {
        const sprite = await this.player.addSprite(path, uid);

        // callback before emitting the event
        callback && callback(sprite.model);

        this.app.emit('live2dLoaded', sprite.model);

        return sprite;
    }

    private async addModel(path: string, callback?: (error?: Error, model?: Live2DModel) => void) {
        try {
            await this.loadModel(path, undefined, (model: Live2DModel) => {
                if (this.config) {
                    // save the model if not been saved
                    const savedModels = get(this.config, 'model.models', []) as SavedModel[];

                    if (!savedModels.find(saved => saved.uid === model.uid)) {
                        savedModels.push(new SavedModel(model.uid, path));
                        this.app.emit('config:model.models', savedModels);
                    }
                }

                // call the callback before "live2dLoaded" event is emitted, otherwise there will be issues in CharacterSettings
                callback && callback(undefined, model);
            });
        } catch (e) {
            callback && callback(e);
        }
    }

    private modelsUpdated(savedModels: SavedModel[]) {
        savedModels.forEach(saved => {
            const sprite = this.player.sprites.find(sprite => sprite.model.uid === saved.uid);
            if (sprite) this.configureSprite(sprite, saved);
        });
    }

    private configureSprite(sprite: Live2DSprite, saved: SavedModel) {
        if (sprite.scale.x !== saved.scale) {
            sprite.scale.x = sprite.scale.y = saved.scale;
        }
    }
}

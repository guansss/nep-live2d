import { App, Module } from '@/App';
import { error, Tagged } from '@/core/utils/log';
import Live2DPlayer from '@/module/live2d/Live2DPlayer';
import { resolve as urlResolve } from 'url';

export default class Live2DModule implements Module, Tagged {
    tag = Live2DModule.name;

    player!: Live2DPlayer;

    install(app: App): void {
        this.player = new Live2DPlayer(app.mka!);
        app.mka!.addPlayer('live2d', this.player);

        this.loadModels();
    }

    loadModels() {
        console.log(process.env);
        const basePath = process.env.VUE_APP_LIVE2D_PATH + '/';
        const models = process.env.VUE_APP_LIVE2D_MODELS;

        if (basePath && models) {
            models.split(',').forEach(model => {
                this.player.addSprite(urlResolve(basePath, model)).catch(e => {
                    // TODO: Show friendly error message
                    error(this, e);
                });
            });
        }
    }
}

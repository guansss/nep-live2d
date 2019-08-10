import { App, Module } from '@/App';
import Live2DPlayer from '@/module/live2d/Live2DPlayer';

export default class Live2DModule implements Module {
    player!: Live2DPlayer;

    install(app: App): void {
        this.player = new Live2DPlayer(app.mka!);
        app.mka!.addPlayer('live2d', this.player);
    }
}

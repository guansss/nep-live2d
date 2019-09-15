import { App, Module } from '@/App';
import SnowPlayer from '@/module/snow/SnowPlayer';

export default class SnowModule implements Module {
    name = 'Snow';

    constructor(app: App) {
        const player = new SnowPlayer();
        app.mka.addPlayer('snow', player);
    }
}

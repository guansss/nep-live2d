import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import get from 'lodash/get';

export interface App {
    on(event: 'bgSelect', fn: (file: string) => void, context?: any): this;
}

export interface BackgroundImage {
    name: string;
}

export default class BackgroundModule implements Module {
    name = 'Background';

    constructor(readonly app: App) {
        app.on('configInit', this.init, this)
            .on('bgSelect', this.selectImage, this);
    }

    init(config: Config) {
        const image = get(config, 'bg.selected', 0);

        document.body.style.backgroundSize = 'cover';
        document.body.style.transition = 'background .2s';
        document.body.style.backgroundImage = image ? `url(${image})` : '';
    }

    selectImage(file: string) {
        document.body.style.backgroundImage = `url(${file})`;

        this.app.emit('config', 'bg.selected', file);
    }
}

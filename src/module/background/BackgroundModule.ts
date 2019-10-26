import { App, Module } from '@/App';

export interface Config {
    bg: {
        image?: string;
    };
}

export default class BackgroundModule implements Module {
    name = 'Background';

    constructor(readonly app: App) {
        app.on('config:bg.img', this.selectImage, this);

        document.body.style.backgroundSize = 'cover';
        document.body.style.transition = 'background .2s';
    }

    selectImage(file: string) {
        document.body.style.backgroundImage = `url("${file}")`;
    }
}

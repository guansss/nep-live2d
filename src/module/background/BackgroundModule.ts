import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import get from 'lodash/get';

export interface App {
    on(event: 'bgSave', fn: (name: string) => void, context?: any): this;
}

export interface BackgroundImage {
    name: string;
}

export default class BackgroundModule implements Module {
    static IMAGE_PATH = '/bg';

    name = 'Background';

    config: Config = {};

    constructor(readonly app: App) {
        app.on('configInit', this.init, this)
            .on('bgSelect', this.selectImage, this)
            .on('bgSave', this.saveImage, this)
            .on('bgDelete', this.deleteImage, this);
    }

    init(config: Config) {
        this.config = config;

        const savedImages = get(this.config, 'bg.images', []) as BackgroundImage[];
        const selectedIndex = get(this.config, 'bg.selected', 0);

        const image = savedImages[selectedIndex]
            ? BackgroundModule.IMAGE_PATH + '/' + savedImages[selectedIndex].name
            : '';

        document.body.style.backgroundSize = 'cover';
        document.body.style.transition = 'background .2s';
        document.body.style.backgroundColor = 'black';
        document.body.style.backgroundImage = `url(${image})`;
    }

    selectImage(name?: string) {
        const image = name ? BackgroundModule.IMAGE_PATH + '/' + name : '';

        document.body.style.backgroundImage = `url(${image})`;

        const selectedIndex = (get(this.config, 'bg.images', []) as BackgroundImage[]).findIndex(
            bgImage => bgImage.name === name,
        );
        if (selectedIndex >= 0) {
            this.app.emit('config', 'bg.selected', selectedIndex);
        }
    }

    saveImage(name: string) {
        const savedImages = get(this.config, 'bg.images', []) as BackgroundImage[];

        if (!savedImages.find(saved => saved.name === name)) {
            savedImages.push({
                name,
            });

            this.app.emit('config', 'bg.images', savedImages);
        }
    }

    deleteImage(name: string) {
        const savedImages = get(this.config, 'bg.images', []) as BackgroundImage[];
        const index = savedImages.findIndex(saved => saved.name === name);

        if (index >= 0) {
            savedImages.splice(index, 1);

            this.app.emit('config', 'bg.images', savedImages);
        }
    }
}

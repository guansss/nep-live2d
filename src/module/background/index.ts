import { App, Module } from '@/App';
import Background from '@/module/background/Background.vue';
import { Config } from '@/module/config';
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

    // this will later be reactive because it will be passed as props into Vue component
    vueProps = {
        image: '',
    };

    constructor(readonly app: App) {
        app.on('configInit', this.init, this)
            .on('bgSelect', this.selectImage, this)
            .on('bgSave', this.saveImage, this);

        app.addComponent(Background, this.vueProps).then();
    }

    init(config: Config) {
        this.config = config;

        const savedImages = get(this.config, 'bg.images', []) as BackgroundImage[];
        const selectedIndex = get(this.config, 'bg.selected', 0);

        this.vueProps.image = savedImages[selectedIndex]
            ? BackgroundModule.IMAGE_PATH + '/' + savedImages[selectedIndex].name
            : '';
    }

    selectImage(name?: string) {
        this.vueProps.image = name ? BackgroundModule.IMAGE_PATH + '/' + name : '';

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
}

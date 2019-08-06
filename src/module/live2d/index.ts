import { App, Module } from '@/App';
import Live2D from 'Live2D.vue';

export default class Live2DModule implements Module {
    install(app: App): void {
        app.addComponent(Live2D);
    }
}

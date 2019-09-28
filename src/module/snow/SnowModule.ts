import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import SnowPlayer from '@/module/snow/SnowPlayer';
import debounce from 'lodash/debounce';

export default class SnowModule implements Module {
    name = 'Snow';

    constructor(app: App) {
        const player = new SnowPlayer();
        app.mka.addPlayer('snow', player, false);

        app.on('configInit', (config: Config) => {
                if (config.snow) {
                    player.number = config.snow.number;

                    if (config.snow.enabled) app.mka.enablePlayer('snow');
                }
            })
            .on('config:snow.enabled', (enabled: boolean) => {
                if (enabled) app.mka.enablePlayer('snow');
                else app.mka.disablePlayer('snow');
            })
            .on(
                'config:snow.number',
                debounce((value: number) => {
                    player.number = value;
                }, 200),
            );
    }
}

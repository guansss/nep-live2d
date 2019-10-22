import { App, Module } from '@/App';
import { screenAspectRatio } from '@/core/utils/misc';
import { THEMES } from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import { ModelConfig } from '@/module/live2d/ModelConfig';

export interface Theme {
    v: number;
    name: string;
    bg: string;
    snow: boolean;
    leaves: boolean;
    models: {
        file: string;
        profiles: {
            // target describes the screen aspect ratio, e.g. 4:3, 16:9, 21:9
            [target: string]: {
                scale: number;
                x: number;
                y: number;
            };
        };
    }[];
}

export default class ThemeModule implements Module {
    readonly name = 'Theme';

    config?: Config;

    // THIS MUST NOT BE EMPTY
    themes = THEMES.slice();

    selected = -1;

    constructor(readonly app: App) {
        app.on('configReady', this.init, this);
    }

    init(config: Config) {
        this.config = config;

        // defaults to first theme in list
        this.app.emit('config', 'theme.selected', 0, true);

        this.changeTheme(config.get('theme.selected', 0), false);

        this.app.on('config:theme.selected', (index: number) => this.changeTheme(index, true));
    }

    changeTheme(index: number, byUser: boolean) {
        if (index !== this.selected) {
            const theme = this.themes[index];

            if (theme) {
                this.selected = index;

                // overwrite user configs if the theme is changed by user
                this.app.emit('config', 'bg.img', theme.bg, !byUser);
                this.app.emit('config', 'leaves.enabled', theme.leaves, !byUser);
                this.app.emit('config', 'snow.enabled', theme.snow, !byUser);

                this.updateModels(theme, byUser);
            }
        }
    }

    updateModels(theme: Theme, byUser: boolean) {
        if (this.config) {
            // remove all internal models
            this.config.get<ModelConfig[]>('live2d.internalModels', []).forEach(config => {
                this.app.emit('live2dRemove', config.id);
            });

            if (byUser) {
                // disable all custom models
                this.config.get<ModelConfig[]>('live2d.models', []).forEach(config => {
                    this.app.emit('live2dConfig', config.id, { enabled: false });
                });
            }
        }

        theme.models.forEach(model => {
            const profile = model.profiles[screenAspectRatio] || model.profiles['16:9']; // fall back to 16:9

            // at lease pass an empty object to let this model be considered an internal model
            this.app.emit('live2dAdd', model.file, profile || {});
        });
    }
}

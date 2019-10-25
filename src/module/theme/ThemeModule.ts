import { App, Module } from '@/App';
import { CHRISTMAS, HALLOWEEN } from '@/core/utils/date';
import { screenAspectRatio } from '@/core/utils/misc';
import { THEME_CHRISTMAS, THEME_HALLOWEEN, THEMES } from '@/defaults';
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

        this.setupInitialTheme(config);

        this.app.on('config:theme.selected', (index: number) => this.changeTheme(index, true));
    }

    setupInitialTheme(config: Config) {
        this.app.emit('config', 'theme.auto', true, true);

        const autoHolidayTheme = config.get('theme.auto', true);

        if (autoHolidayTheme) {
            const index = HALLOWEEN ? THEME_HALLOWEEN : CHRISTMAS ? THEME_CHRISTMAS : 0;
            const shouldOverride = index !== config.get('theme.selected', -1);

            this.app.emit('config', 'theme.selected', index);
            this.changeTheme(index, shouldOverride);
        } else {
            this.app.emit('config', 'theme.selected', 0, true);
            this.changeTheme(config.get('theme.selected', 0), false);
        }
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
                this.config.get<ModelConfig[]>('live2d.models', []).forEach(config => {
                    if (config.internal) {
                        // enable internal models only if they belong to this theme
                        this.app.emit('live2dConfig', config.id, {
                            enabled: theme.models.find(model => model.file === config.path),
                        });
                    } else {
                        // disable all custom models
                        this.app.emit('live2dConfig', config.id, { enabled: false });
                    }
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

import { App, Module } from '@/App';
import { error } from '@/core/utils/log';
import { screenAspectRatio } from '@/core/utils/misc';
import { SEASONS, THEMES } from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import { ModelConfig } from '@/module/live2d/ModelConfig';

export interface Config {
    theme?: {
        custom: Theme[];
        selected?: string;
        seasonal?: boolean;
    };
}

export interface Theme {
    v: number;
    name: string;
    season?: string;
    bg: string;
    snow: boolean;
    leaves: boolean;
    models: {
        file: string;
        scale: number;
        x: number;
        y: number;
    }[];
    profiles?: {
        // target describes the screen aspect ratio, e.g. 4:3, 16:9, 21:9
        [target: string]: Partial<Theme>;
    };
}

export const THEME_VERSION = 1;

const TAG = 'THEME';

export default class ThemeModule implements Module {
    readonly name = 'Theme';

    config?: Config;

    themes = THEMES.slice();

    selected = -1;

    constructor(readonly app: App) {
        app.on('themeSave', this.saveTheme, this)
            .on('configReady', this.init, this)
            .on('config:theme.selected', (selected: number) => this.changeTheme(selected))
            .on('config:theme.custom', (custom: Theme[]) => (this.themes = [...THEMES, ...custom]));
    }

    init(config: Config) {
        this.config = config;

        this.themes = [...THEMES, ...config.get<Theme[]>('theme.custom', [])];

        this.setupInitialTheme(config);
    }

    setupInitialTheme(config: Config) {
        this.app.emit('config', 'theme.seasonal', true, true);

        const selected = config.get('theme.selected', -1);

        // defaults to first theme in list
        let index = selected === -1 ? 0 : selected;

        const seasonal = config.get('theme.seasonal', true);

        if (seasonal) {
            const activeSeason = SEASONS.find(season => season.active);

            if (activeSeason) {
                const seasonalThemeIndex = THEMES.findIndex(theme => theme.season === activeSeason.value);

                if (seasonalThemeIndex !== -1) index = seasonalThemeIndex;
            }
        }

        // change theme only when the index does not match the selected one
        if (index !== selected) {
            this.app.emit('config', 'theme.selected', index);
        }
    }

    changeTheme(index: number) {
        if (index === this.selected) return;

        let theme = this.themes[index];

        if (theme) {
            this.selected = index;

            if (theme.profiles) {
                const profile = theme.profiles[screenAspectRatio] || theme.profiles['16:9']; // fall back to 16:9

                if (profile) {
                    // override the theme by profile
                    theme = { ...theme, ...profile };
                }
            }

            // overwrite user configs if the theme is changed by user
            this.app.emit('config', 'bg.img', theme.bg);
            this.app.emit('config', 'leaves.enabled', theme.leaves);
            this.app.emit('config', 'snow.enabled', theme.snow);

            this.app.emit('live2dRemoveAll');

            theme.models.forEach(model => this.app.emit('live2dAdd', model.file, model));
        } else {
            error(TAG, 'Theme not found at index ' + index);
        }
    }

    saveTheme(name: string) {
        if (this.config) {
            const bg = this.config.get('bg.img', '');
            const leaves = this.config.get('leaves.enabled', false);
            const snow = this.config.get('snow.enabled', false);

            const models = this.config.get<ModelConfig[]>('live2d.models', []) as {
                [P in keyof ModelConfig]-?: ModelConfig[P]
            }[];

            const theme: Theme = {
                name,
                bg,
                snow,
                leaves,
                v: THEME_VERSION,
                models: models.map(({ file, scale, x, y }) => ({ file, scale, x, y })),
            };

            const customThemes = this.config.get<Theme[]>('theme.custom', []);

            this.app.emit('config:theme.custom', [...customThemes, theme]);
        }
    }
}

import { App, Module } from '@/App';
import { error } from '@/core/utils/log';
import { screenAspectRatio } from '@/core/utils/misc';
import { SEASONS, THEME_CUSTOM_OFFSET, THEMES } from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import { ModelConfig } from '@/module/live2d/ModelConfig';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

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

    customThemes: Theme[] = [];

    // built-in themes: 0 <= index < THEME_INDEX_BASIS
    // custom themes: index > THEME_INDEX_BASIS
    selected = -1;

    constructor(readonly app: App) {
        app.on('themeCheck', this.checkThemeUnsaved, this)
            .on('themeSave', this.saveTheme, this)
            .on('config:theme.selected', (selected: number) => this.setTheme(selected))
            .on('config:theme.custom', (custom: Theme[]) => (this.customThemes = custom))
            .on('configReady', (config: Config) => {
                this.config = config;

                this.customThemes = config.get<Theme[]>('theme.custom', []).slice();

                this.app.emit('config', 'theme.seasonal', true, true);

                const seasonalIndex = this.getSeasonalThemeIndex();

                if (seasonalIndex !== -1) {
                    this.app.emit('config', 'theme.selected', seasonalIndex);
                }
            })
            .on('init', () => {
                // apply default theme if there is no applicable seasonal theme
                if (this.getSeasonalThemeIndex() === -1) {
                    this.app.emit('config', 'theme.selected', 0);
                }
            });
    }

    getSeasonalThemeIndex() {
        if (this.config) {
            const seasonal = this.config.get('theme.seasonal', true);

            if (seasonal) {
                const activeSeason = SEASONS.find(season => season.active);

                if (activeSeason) {
                    // custom themes have a higher priority than built-in ones
                    const index = this.customThemes.findIndex(theme => theme.season === activeSeason.value);

                    if (index !== -1) return index + THEME_CUSTOM_OFFSET;

                    return THEMES.findIndex(theme => theme.season === activeSeason.value);
                }
            }
        }
        return -1;
    }

    setTheme(index: number) {
        if (index === this.selected) return;

        const theme = index < THEME_CUSTOM_OFFSET ? THEMES[index] : this.customThemes[index - THEME_CUSTOM_OFFSET];

        if (theme) {
            this.selected = index;

            // skip when this theme is exactly the same with current one
            if (isEqual(omit(theme, 'season'), this.collectTheme(theme.name))) return;

            if (theme.profiles) {
                const profile = theme.profiles[screenAspectRatio] || theme.profiles['16:9']; // fall back to 16:9

                // override the theme by profile
                Object.assign(theme, profile);
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

    collectTheme(name: string) {
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

            return theme;
        }
    }

    checkThemeUnsaved(callback: (unsaved: boolean) => void) {
        const theme = this.collectTheme('');

        if (theme) {
            for (const _theme of THEMES.concat(this.customThemes)) {
                if (isEqual(omit(_theme, ['name', 'season']), omit(theme, ['name']))) {
                    callback(false);
                    return;
                }
            }

            callback(true);
        }

        // don't callback if failed to collect current theme
    }

    saveTheme(name: string) {
        const theme = this.collectTheme(name);

        if (theme) {
            this.app.emit('config', 'theme.custom', [...this.customThemes, theme]);
        }
    }
}

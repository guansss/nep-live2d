import { isInRange } from '@/core/utils/date';
import { Theme, THEME_VERSION } from '@/module/theme/ThemeModule';

export const LOCALE = 'en-us';

interface Season {
    active: boolean;
    value: string;
}

export const HALLOWEEN = { value: 'Halloween', active: isInRange('10-25', '11-5') };
export const CHRISTMAS = { value: 'Christmas', active: isInRange('12-20', '12-31') };
export const NEW_YEAR = { value: 'NewYear', active: isInRange('1-1', '1-10') };

export const SEASONS: Season[] = [HALLOWEEN, CHRISTMAS, NEW_YEAR];

export const THEMES: Theme[] = [
    {
        v: THEME_VERSION,
        name: 'Default',
        bg: 'img/bg_forest.jpg',
        snow: false,
        leaves: true,
        models: [
            {
                file: 'live2d/neptune/neptune.model.json',
                scale: 0.0004141,
                x: 0.75,
                y: 0.6,
            },
        ],
    },
    {
        v: THEME_VERSION,
        name: 'Halloween',
        season: HALLOWEEN.value,
        bg: 'img/bg_halloween.jpg',
        snow: true,
        leaves: false,
        models: [
            {
                file: 'live2d/neptune/neptune.model.json',
                scale: 0.0004141,
                x: 0.75,
                y: 0.6,
            },
        ],
    },
    {
        v: THEME_VERSION,
        name: 'Christmas',
        season: CHRISTMAS.value,
        bg: 'img/bg_lowee.jpg',
        snow: true,
        leaves: false,
        models: [
            {
                file: 'live2d/nepsanta/nepsanta.model.json',
                scale: 0.0004141,
                x: 0.75,
                y: 0.6,
            },
        ],
    },
];

export const BACKGROUNDS = THEMES.map(theme => theme.bg);

export const FPS_MAX = 60;
export const FPS_MAX_LIMIT = 300;

export const LIVE2D_DIRECTORY = 'live2d';
export const LIVE2D_SCALE_MAX = 1.5;

export const FOCUS_TIMEOUT = 2000;
export const FOCUS_TIMEOUT_MAX = 10000;

export const SNOW_NUMBER = ~~((innerWidth * innerHeight) / 1000);
export const SNOW_NUMBER_MIN = 10;
export const SNOW_NUMBER_MAX = 9999;

export const LEAVES_NUMBER = ~~(innerWidth / 10);
export const LEAVES_NUMBER_MIN = 1;
export const LEAVES_NUMBER_MAX = 500;

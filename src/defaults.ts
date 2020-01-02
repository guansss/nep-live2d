import { isInRange } from '@/core/utils/date';
import { clamp } from '@/core/utils/math';
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

export const BG_DIRECTORY = 'img';

export const THEMES: Theme[] = [
    {
        v: THEME_VERSION,
        name: 'Default',
        snow: false,
        leaves: true,
        bg: {
            src: BG_DIRECTORY + '/bg_forest.jpg',
        },
        models: [
            {
                file: 'live2d/neptune/neptune.model.json',
                scale: 0.0004141,
                x: 0.75,
                y: 0.6,
                order: 0,
            },
        ],
    },
    {
        v: THEME_VERSION,
        name: 'Halloween',
        season: HALLOWEEN.value,
        snow: true,
        leaves: false,
        bg: {
            src: BG_DIRECTORY + '/bg_halloween.jpg',
        },
        models: [
            {
                file: 'live2d/neptune/neptune.model.json',
                scale: 0.0004141,
                x: 0.75,
                y: 0.6,
                order: 0,
            },
        ],
    },
    {
        v: THEME_VERSION,
        name: 'Christmas',
        season: CHRISTMAS.value,
        snow: true,
        leaves: false,
        bg: {
            src: BG_DIRECTORY + '/bg_lowee.jpg',
        },
        models: [
            {
                file: 'live2d/nepsanta/nepsanta.model.json',
                scale: 0.0004141,
                x: 0.75,
                y: 0.6,
                order: 0,
            },
        ],
    },
];

// A basis to divide the saved index of selected theme between built-in themes and custom themes. Avoid using a unified
//  index for both built-in and custom themes because the amount of built-in themes may increase in future updates.
export const THEME_CUSTOM_OFFSET = 100;

export const BACKGROUNDS = THEMES.map(theme => theme.bg.src);

export const FPS_MAX = 60;
export const FPS_MAX_LIMIT = 300;

export const VOLUME = 0.05;

export const Z_INDEX_LIVE2D = 100;
export const Z_INDEX_LEAVES = 120;
export const Z_INDEX_LEAVES_BACK = 90;
export const Z_INDEX_SNOW = 110;
export const Z_INDEX_SNOW_BACK = 80;

export const LIVE2D_DIRECTORY = 'live2d';
export const LIVE2D_SCALE_MAX = 1.5;

export const FOCUS_TIMEOUT = 2000;
export const FOCUS_TIMEOUT_MAX = 10000;

export const HIGH_QUALITY = true;

export const SNOW_NUMBER_MIN = 10;
export const SNOW_NUMBER_MAX = 9999;
export const SNOW_NUMBER = clamp(~~((innerWidth * innerHeight) / 1000), SNOW_NUMBER_MIN, SNOW_NUMBER_MAX);

export const LEAVES_NUMBER_MIN = 1;
export const LEAVES_NUMBER_MAX = 500;
export const LEAVES_NUMBER = clamp(~~(innerWidth / 10), LEAVES_NUMBER_MIN, LEAVES_NUMBER_MAX);

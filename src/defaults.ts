import { Theme } from '@/module/theme/ThemeModule';

export const LIVE2D_DIRECTORY = 'live2d';

export const THEMES: Theme[] = [
    {
        v: 1,
        name: 'Default',
        bg: 'img/bg_forest.jpg',
        snow: false,
        models: [
            {
                file: 'live2d/neptune/neptune.model.json',
                profiles: {
                    '16:9': {
                        scale: 0.0004,
                        x: 0.5,
                        y: 0.7,
                    },
                },
            },
        ],
    },
    {
        v: 1,
        name: 'Christmas',
        bg: 'img/bg_lowee.jpg',
        snow: true,
        models: [
            {
                file: 'live2d/nepsanta/nepsanta.model.json',
                profiles: {
                    '16:9': {
                        scale: 0.0004,
                        x: 0.5,
                        y: 0.7,
                    },
                },
            },
        ],
    },
];

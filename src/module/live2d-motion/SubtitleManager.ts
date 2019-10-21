import Live2DModel from '@/core/live2d/Live2DModel';
import { error } from '@/core/utils/log';
import { getJSON } from '@/core/utils/net';

type SubtitleJSON = Language[];

interface Language {
    locale: string;
    name: string;
    description?: string;
    font?: string;
    style?: string;
    subtitles: Subtitle[];
}

export interface Subtitle {
    name: string;
    text: string;
    style?: string;
    duration?: number;
}

const TAG = 'SubtitleManager';

const DEFAULT_LOCALE = 'default';

export default class SubtitleManager {
    locale = DEFAULT_LOCALE;

    subtitles: { [file: string]: SubtitleJSON } = {};

    async loadSubtitle(model: Live2DModel) {
        const file = model.modelSettings.subtitle;

        if (file) {
            try {
                const languages = (await getJSON(file)) as SubtitleJSON;

                languages.forEach(language => {
                    language.style = (language.style || '') + ';';

                    // append `font` to `style`
                    language.style += language.font ? 'font-family:' + language.font : '';

                    // apply language style to each subtitle
                    language.subtitles.forEach(subtitle => {
                        subtitle.style = language.style + ';' + (subtitle.style || '');
                    });
                });

                this.subtitles[file] = languages;
            } catch (e) {
                error(TAG, `Failed to load subtitles for [${model.name}] from ${file}`, e);
            }
        }
    }

    getSubtitle(file: string, name: string) {
        const json = this.subtitles[file];

        if (!json) return;

        const getFromLocale = (locale: string) => {
            const lowerCaseLocale = locale.toLowerCase();

            for (const language of json) {
                if (language.locale.toLowerCase().includes(lowerCaseLocale)) {
                    for (const subtitle of language.subtitles) {
                        if (subtitle.name === name) {
                            return subtitle;
                        }
                    }
                }
            }
        };

        return getFromLocale(this.locale) || getFromLocale(DEFAULT_LOCALE);
    }

    showSubtitle(model: Live2DModel, name: string, timingPromise?: Promise<any>) {
        const subtitle = this.getSubtitle(model.modelSettings.subtitle || '', name);

        if (subtitle) {
            const id = this.show(subtitle);

            if (!isNaN(subtitle.duration!)) {
                setTimeout(() => this.dismiss(id), subtitle.duration);
            } else if (timingPromise) {
                timingPromise.then(() => this.dismiss(id));
            }

            return subtitle;
        }
    }

    // to be overridden
    show(subtitle: Subtitle) {
        return -1;
    }

    dismiss(id: number) {}
}

import Live2DModel from '@/core/live2d/Live2DModel';
import { error, Tagged } from '@/core/utils/log';
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

const DEFAULT_LOCALE = 'default';

export default class SubtitleManager implements Tagged {
    tag = SubtitleManager.name;

    locale = DEFAULT_LOCALE;

    subtitles: { [file: string]: SubtitleJSON } = {};

    /**
     * @param displayingSubtitles
     */
    constructor(public displayingSubtitles: Subtitle[]) {}

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
                error(this, `Failed to load subtitles for [${model.name}] from ${file}`, e);
            }
        }
    }

    showSubtitle(model: Live2DModel, name: string, timingPromise?: Promise<any>) {
        const subtitle = this.getSubtitle(model.modelSettings.subtitle || '', name);

        if (subtitle) {
            this.displayingSubtitles.push(subtitle);

            if (!isNaN(subtitle.duration as number)) {
                setTimeout(() => this.dismissSubtitle(subtitle), subtitle.duration);
            } else if (timingPromise) {
                timingPromise.then(() => this.dismissSubtitle(subtitle));
            }

            return subtitle;
        }
    }

    dismissSubtitle(subtitle: Subtitle) {
        const index = this.displayingSubtitles.indexOf(subtitle);

        if (index >= 0) {
            this.displayingSubtitles.splice(index, 1);
        }
    }

    getSubtitle(file: string, name: string): Subtitle | undefined {
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
}

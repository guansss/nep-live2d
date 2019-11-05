import { error } from '@/core/utils/log';
import { getJSON } from '@/core/utils/net';

export type SubtitleJSON = Language[];

export interface Language {
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

const FALLBACK_LOCALE = 'default';

export default class SubtitleManager {
    defaultLocale = FALLBACK_LOCALE;

    subtitles: { [file: string]: SubtitleJSON } = {};

    tasks: { [file: string]: Promise<any> } = {};

    async loadSubtitle(file: string): Promise<SubtitleJSON | undefined> {
        if (this.subtitles[file]) return this.subtitles[file];

        this.tasks[file] = (async () => {
            try {
                const languages = (await getJSON(file)) as SubtitleJSON;

                languages.forEach(language => {
                    language.locale = language.locale.toLowerCase();

                    language.style = (language.style || '') + ';';

                    // append `font` to `style`
                    language.style += language.font ? 'font-family:' + language.font : '';

                    // apply language style to each subtitle
                    language.subtitles.forEach(subtitle => {
                        subtitle.style = language.style + ';' + (subtitle.style || '');
                    });
                });

                this.subtitles[file] = languages;

                return languages;
            } catch (e) {
                error(TAG, `Failed to load subtitles from ${file}`, e);
            } finally {
                delete this.tasks[file];
            }
        })();

        return this.tasks[file];
    }

    async getSubtitle(file: string, name: string, locale?: string): Promise<Subtitle | undefined> {
        if (this.tasks[file]) {
            await this.tasks[file];
        }

        const json = this.subtitles[file];
        if (!json) return;

        for (const loc of [locale, this.defaultLocale, FALLBACK_LOCALE]) {
            if (loc) {
                for (const language of json) {
                    if (language.locale.includes(loc)) {
                        for (const subtitle of language.subtitles) {
                            if (subtitle.name === name) {
                                return subtitle;
                            }
                        }
                    }
                }
            }
        }
    }

    async showSubtitle(file: string, name: string, locale?: string, timingPromise?: Promise<any>) {
        const start = Date.now();

        const subtitle = await this.getSubtitle(file, name, locale);

        if (subtitle) {
            if (!isNaN(subtitle.duration!)) {
                const id = this.show(subtitle);
                const remains = subtitle.duration! - (Date.now() - start);
                setTimeout(() => this.dismiss(id), remains);
            } else if (timingPromise) {
                const id = this.show(subtitle);
                timingPromise.then(() => this.dismiss(id)).catch(() => this.dismiss(id));
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

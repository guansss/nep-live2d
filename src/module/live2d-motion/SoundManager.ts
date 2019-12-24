import { error } from '@/core/utils/log';
import { clamp } from '@/core/utils/math';
import { VOLUME } from '@/defaults';

const TAG = 'SoundManager';

export default class SoundManager {
    private _volume = VOLUME;

    get volume(): number {
        return this._volume;
    }

    set volume(value: number) {
        this._volume = clamp(value, 0, 1) || 0;
        this.audios.forEach(audio => (audio.volume = this._volume));
    }

    tag = SoundManager.name;

    audios: HTMLAudioElement[] = [];

    playSound(file: string): Promise<void> {
        const audio = new Audio(file);
        audio.volume = this._volume;

        this.audios.push(audio);

        return new Promise((resolve, reject) => {
            audio.addEventListener('ended', () => {
                this.audios.splice(this.audios.indexOf(audio));
                resolve();
            });
            audio.addEventListener('error', reject);

            const playResult = audio.play();

            if (playResult) {
                playResult.catch(e => {
                    error(TAG, e);
                    reject(e);
                });
            }
        });
    }
}

import { error, Tagged } from '@/core/utils/log';

export default class SoundManager implements Tagged {
    tag = SoundManager.name;

    volume = 0.5;

    playSound(file: string) {
        const audio = new Audio(file);
        audio.volume = this.volume;

        const promise = audio.play();

        if (promise) {
            promise.catch(e => error(this, e));
        }

        return audio;
    }
}

import Mka from '@/core/mka/Mka';
import Ticker from '@/core/mka/Ticker';

export default abstract class Player {
    readonly mka?: Mka;

    readonly enabled: boolean = false;
    readonly paused: boolean = false;

    /**
     * @returns True if the content is actually updated.
     */
    update(ticker: Ticker): boolean {
        return false;
    }

    attach() {}

    detach() {}

    enable() {}

    disable() {}

    resume() {}

    pause() {}

    destroy() {}
}

export type InternalPlayer = { -readonly [P in keyof Player]: Player[P] };

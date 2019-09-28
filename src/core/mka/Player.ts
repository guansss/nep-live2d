import Mka from '@/core/mka/Mka';

export default abstract class Player {
    readonly mka?: Mka;

    readonly enabled: boolean = false;
    readonly paused: boolean = false;

    /**
     * @returns True if the content is actually updated.
     */
    abstract update(): boolean;

    attach() {}

    detach() {}

    enable() {}

    disable() {}

    resume() {}

    pause() {}

    destroy() {}
}

export type InternalPlayer = { -readonly [P in keyof Player]: Player[P] };

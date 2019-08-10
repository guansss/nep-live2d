import Mka from '@/core/mka/Mka';

export default abstract class Player {
    mka?: Mka;

    enabled = true;
    paused = false;

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

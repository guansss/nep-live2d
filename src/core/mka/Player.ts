export default abstract class Player {
    enabled = true;
    paused = false;

    /**
     * @param dt - Delta time
     * @returns True if the content is actually updated.
     */
    abstract update(dt: number): boolean;

    attach() {}

    detach() {}

    enable() {}

    disable() {}

    resume() {}

    pause() {}

    destroy() {}
}

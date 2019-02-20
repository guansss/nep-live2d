export default class Player {
    /**
     * @interface
     * @param {number} dt - Delta time
     */
    update(dt) {}

    /**
     * @interface
     */
    pause() {}

    /**
     * @interface
     */
    resume() {}

    /**
     * @interface
     */
    attach() {}

    /**
     * @interface
     */
    detach() {}

    /**
     * @interface
     */
    destroy() {}
}

export default abstract class Player {
    enabled = true;
    paused = false;

    /**
     * @param dt - Delta time
     * @returns True if the content is actually updated.
     */
    abstract update(dt: number): boolean;

    abstract attach(): void;

    abstract detach(): void;

    abstract enable(): void;

    abstract disable(): void;

    abstract resume(): void;

    abstract pause(): void;

    abstract destroy(): void;
}

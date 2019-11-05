const FILTER_STRENGTH = 20;

namespace Ticker {
    const start = performance.now();

    export let now = start;
    export let then = start;
    export let elapsed = now - start;
    export let delta = now - then;

    let maxFps = 60;
    let frameInterval = 1000 / maxFps;
    let actualFrameInterval = frameInterval;

    export function getMaxFPS() {
        return maxFps;
    }

    // see https://stackoverflow.com/a/19772220
    export function setMaxFPS(fps: number) {
        maxFps = fps;
        frameInterval = 1000 / fps;
    }

    export function getFPS() {
        return ~~(1000 / actualFrameInterval);
    }

    /**
     * @returns True if this tick is available for animation.
     */
    export function tick(time: DOMHighResTimeStamp): boolean {
        now = time;
        elapsed = now - start;
        delta = now - then;

        if (delta > frameInterval) {
            // for calculating actual FPS, see https://stackoverflow.com/a/5111475
            actualFrameInterval += (delta - actualFrameInterval) / FILTER_STRENGTH;

            then = now - (elapsed % frameInterval);

            return true;
        }

        return false;
    }
}

export default Ticker;

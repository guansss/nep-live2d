import { FPS_MAX } from '@/defaults';

const FILTER_STRENGTH = 20;

namespace Ticker {
    const start = performance.now();

    export let now = start;
    export let elapsed = now - start;

    let before = start;
    export let delta = now - before;

    // see https://stackoverflow.com/a/19772220
    let then = start;
    let adjustedDelta = now - then;

    // see https://stackoverflow.com/a/5111475
    let maxFps = FPS_MAX;
    let frameInterval = 1000 / maxFps;
    let actualFrameInterval = frameInterval;

    export function getMaxFPS() {
        return maxFps;
    }

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
        elapsed = time - start;

        delta = time - before;
        adjustedDelta = time - then;

        if (adjustedDelta > frameInterval) {
            before = time;
            then = time - (adjustedDelta % frameInterval);

            actualFrameInterval += (delta - actualFrameInterval) / FILTER_STRENGTH;

            return true;
        }

        return false;
    }
}

export default Ticker;

import { inWallpaperEngine } from '@/core/utils/misc';

declare global {
    interface Screen {
        // these properties are supposed to exist but somehow missing in Typescript
        availTop: number;
        availLeft: number;
    }
}

const safeWidth = inWallpaperEngine ? screen.availWidth : innerWidth;
const safeHeight = inWallpaperEngine ? screen.availHeight : innerHeight;
const safeTop = inWallpaperEngine ? screen.availTop : 0;
const safeLeft = inWallpaperEngine ? screen.availLeft : 0;
const safeBottom = inWallpaperEngine ? screen.height - (screen.availHeight + screen.availTop) : 0;
const safeRight = inWallpaperEngine ? screen.width - (screen.availWidth + screen.availLeft) : 0;

export namespace SafeArea {
    export const SAFE = {
        width: safeWidth,
        height: safeHeight,
        top: safeTop,
        right: safeRight,
        bottom: safeBottom,
        left: safeLeft,

        widthPX: safeWidth + 'px',
        heightPX: safeHeight + 'px',
        topPX: safeTop + 'px',
        rightPX: safeRight + 'px',
        bottomPX: safeBottom + 'px',
        leftPX: safeLeft + 'px',
    };

    export const UNSAFE = {
        width: innerWidth,
        height: innerHeight,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,

        widthPX: innerWidth + 'px',
        heightPX: innerHeight + 'px',
        topPX: '0',
        rightPX: '0',
        bottomPX: '0',
        leftPX: '0',
    };

    export let area = SAFE;

    export function setSafe(safe: boolean) {
        if (safe) {
            area = SAFE;
            document.documentElement.style.setProperty('--safeTop', SAFE.topPX);
            document.documentElement.style.setProperty('--safeRight', SAFE.rightPX);
            document.documentElement.style.setProperty('--safeLeft', SAFE.leftPX);
            document.documentElement.style.setProperty('--safeBottom', SAFE.bottomPX);
        } else {
            area = UNSAFE;
            document.documentElement.style.removeProperty('--safeTop');
            document.documentElement.style.removeProperty('--safeRight');
            document.documentElement.style.removeProperty('--safeLeft');
            document.documentElement.style.removeProperty('--safeBottom');
        }
    }
}

export const SCREEN_ASPECT_RATIO = (() => {
    // https://stackoverflow.com/a/1186465

    function gcd(a: number, b: number): number {
        return b == 0 ? a : gcd(b, a % b);
    }

    const w = screen.width;
    const h = screen.height;
    const r = gcd(w, h);

    return w / r + ':' + h / r;
})();

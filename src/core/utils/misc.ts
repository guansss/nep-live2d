import camelCase from 'lodash/camelCase';

// check if running in Wallpaper Engine
export const inWallpaperEngine = !!window.wallpaperRequestRandomFileForProperty;

// when this page is redirected from "bridge.html", a `redirect` will be set in URL's search parameters
export const redirectedFromBridge = !!new URLSearchParams(location.search.slice(1)).get('redirect');

/**
 * Deep clones a JSON object, converting all the property names to camel case.
 * @param value - JSON object.
 * @returns Cloned object.
 */
export function cloneWithCamelCase(value: any): any {
    if (Array.isArray(value)) {
        return value.map(cloneWithCamelCase);
    }

    if (value && typeof value === 'object') {
        const clone: any = {};

        for (const key of Object.keys(value)) {
            clone[camelCase(key)] = cloneWithCamelCase(value[key]);
        }

        return clone;
    }

    return value;
}

export function nop(): any {}

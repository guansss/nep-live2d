/**
 * Generates a random ID with 5 characters.
 *
 * @see https://stackoverflow.com/a/8084248
 */
export function randomID() {
    return (Math.random() + 1)
        .toString(36)
        .substring(2, 7)
        .toUpperCase();
}

/**
 * Generates a random CSS HSL color by given string.
 *
 * @see https://stackoverflow.com/a/21682946
 */
export function randomHSLColor(str: string, s = '100%', l = '30%') {
    let hash = 0,
        i,
        chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return `hsl(${hash % 360},${s},${l})`;
}

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

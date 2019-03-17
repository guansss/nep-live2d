/**
 * Pixi doesn't provide type definitions for individual packages,
 * so this is the temporary way to reference to types declared
 * in its main declaration file.
 *
 * This file will be used until module definitions are officially supported.
 * @see https://github.com/pixijs/pixi.js/issues/5397
 */

declare module '@pixi/display' {
    export { Container } from 'pixi.js';
}

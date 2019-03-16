/**
 * Pixi doesn't provide type definitions for individual packages,
 * so I managed to reference the types to its main declaration file in this way.
 *
 * This file will be used until module definitions are officially supported.
 * @see https://github.com/pixijs/pixi.js/issues/5397
 */

declare module '@pixi/display' {
    import { Container as _Container } from 'pixi.js';

    export class Container extends _Container {}
}

import camelCase from 'lodash/camelCase';
import merge from 'lodash/merge';

export default class ModelSettings {
    // these properties are listed here just to help with the code analysis in IDEs

    name = '';
    model = '';
    textures = [''];
    pose = '';
    physics = '';
    subtitle = '';

    /** @type {Object<string, number>} */
    layout = {};

    /** @type {{name: string, id: string}[]} */
    hitAreas = [];

    /** @type {{name: string, file: string}[]} */
    expressions = [];

    /**
     * @typedef {Object} Motion
     * @property {string} file - `.mtn` file
     * @property {string} [sound] - sound file
     * @property {string} [subtitle] - subtitle's name
     * @property {number} [fadeIn] - motion fade in timeout
     * @property {number} [fadeOut] - motion fade out timeout
     * @property {number} [time] - start time in hours (for start-up motions only)
     */

    /** @type {Object<string, Motion[]>} */
    motions = {
        idle: [],
    };

    /**
     * @param {Object} json
     */
    static fromJson(json) {
        const instance = new this();

        const clone = cloneWithCamelCase(json);
        merge(instance, clone);

        return instance;
    }
}

/**
 * Clones an **JSON**, converting all the properties to camel case.
 * @param {Object} value
 * @return {Object}
 */
function cloneWithCamelCase(value) {
    if (Array.isArray(value)) {
        return value.map(cloneWithCamelCase);
    }

    if (value && typeof value === 'object') {
        const clone = {};

        for (const key in Object.keys(value)) {
            clone[camelCase(key)] = value[key];
        }

        return clone;
    }

    return value;
}

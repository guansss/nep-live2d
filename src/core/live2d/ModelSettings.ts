// @ts-ignore
import { resolve as urlResolve } from 'url';
import { get, set } from 'lodash';
import logger from '@/core/utils/log';
import { cloneWithCamelCase } from '@/core/utils/misc';

const log = logger('ModelSettings');

interface MotionDef {
    /** `*.mtn` file. */
    file: string;

    /** Sound file. */
    sound?: string;

    /** Subtitle name. */
    subtitle?: string;

    /** Motion fade-in timeout. */
    fadeIn?: number;

    /** Motion fade-out timeout. */
    fadeOut?: number;

    /** Start time in hours (for start-up motions only). */
    time?: number;
}

interface ExpressionDef {
    name: string;

    /** `*.json` file. */
    file: string;
}

export default class ModelSettings {
    name?: string;

    // files
    model: string = '';
    pose?: string;
    physics?: string;
    subtitle?: string;
    textures: string[] = [];

    // metadata
    layout: { [id: string]: number } = {};
    hitAreas?: { name: string; id: string }[];

    // motions
    expressions?: ExpressionDef[];
    motions: { [group: string]: MotionDef[] } = {};

    /**
     * @param json - The model settings JSON
     * @param basePath - Base path of the model.
     */
    constructor(json: any, basePath: string) {
        if (!(json && typeof json === 'object')) {
            throw new TypeError('Invalid JSON.');
        }

        this.copy(cloneWithCamelCase(json));
        this.convertPaths(basePath);

        log(JSON.stringify(this, null, 2));
    }

    /**
     * Validates and copies properties from JSON.
     *
     * The `json` param borrows `ModelSettings` type to prevent the annoying type checking,
     * types will be manually checked.
     */
    private copy(json: ModelSettings) {
        // begin essential properties

        copyProperty(this, json, 'model', 'string');

        if (!this.model) {
            throw new TypeError('Missing model file.');
        }

        if (json.textures) {
            this.textures = json.textures.filter(file => typeof file === 'string');
        }

        if (this.textures.length === 0) {
            throw new TypeError('Missing textures.');
        }

        // end essential properties

        copyProperty(this, json, 'name', 'string');
        copyProperty(this, json, 'pose', 'string');
        copyProperty(this, json, 'physics', 'string');
        copyProperty(this, json, 'subtitle', 'string');

        if (json.layout && typeof json.layout === 'object') {
            // copy only the number properties
            for (const [key, value] of Object.entries(json.layout)) {
                if (!isNaN(value)) {
                    this.layout[key] = value;
                }
            }
        }

        if (Array.isArray(json.hitAreas)) {
            const filter = (hitArea: any) => typeof hitArea.name === 'string' && typeof hitArea.id === 'string';
            this.hitAreas = json.hitAreas.filter(filter);
        }

        if (Array.isArray(json.expressions)) {
            const filter = (exp: any) => typeof exp.name === 'string' && typeof exp.file === 'string';
            this.expressions = json.expressions.filter(filter);
        }

        if (json.motions && typeof json.motions === 'object') {
            for (const [group, motionGroup] of Object.entries(json.motions)) {
                if (Array.isArray(motionGroup)) {
                    this.motions[group] = motionGroup

                        // filter out the motions without `file` defined
                        .filter(motion => motion && typeof motion.file === 'string')

                        // copy only the valid properties
                        .map((motion: any) => {
                            const copy: MotionDef = {
                                file: motion.file,
                            };

                            copyProperty(copy, motion, 'sound', 'string');
                            copyProperty(copy, motion, 'subtitle', 'string');
                            copyProperty(copy, motion, 'fadeIn', 'number');
                            copyProperty(copy, motion, 'fadeOut', 'number');
                            copyProperty(copy, motion, 'time', 'number');

                            return copy;
                        });
                }
            }
        }
    }

    /**
     * Converts each file from relative path to absolute path.
     */
    private convertPaths(basePath: string) {
        const convertProperty = (obj: object, propertyPath: string) => {
            const path: string = get(obj, propertyPath);

            if (path) {
                set(obj, propertyPath, urlResolve(basePath, path));
            }
        };
        const convertArray = (obj: object, arrayPath: string, propertyPath: string) => {
            const array: [] = get(this, arrayPath);

            if (Array.isArray(array)) {
                array.forEach(obj => convertProperty(obj, propertyPath));
            }
        };

        convertProperty(this, 'model');
        convertProperty(this, 'pose');
        convertProperty(this, 'physics');
        convertProperty(this, 'subtitle');

        convertArray(this, 'textures', 'file');
        convertArray(this, 'expressions', 'file');

        Object.entries(this.motions).forEach(([group]) => convertArray(this.motions, group, 'file'));
    }
}

/**
 * Copies a property at `path` only if it matches the `type`.
 */
function copyProperty(dest: object, src: object, path: string, type: string) {
    const value = get(src, path);

    if (typeof value === type) {
        set(dest, path, value);
    }
}

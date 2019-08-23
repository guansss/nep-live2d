import { Tagged } from '@/core/utils/log';
import { cloneWithCamelCase } from '@/core/utils/misc';
import { get, set } from 'lodash';
import { resolve as urlResolve } from 'url';

export interface MotionDefinition {
    readonly name?: string;

    /** `*.mtn` file. */
    readonly file: string;

    /** Sound file. */
    readonly sound?: string;

    /** Subtitle name. */
    readonly subtitle?: string;

    /** Motion fade-in timeout. */
    readonly fadeIn?: number;

    /** Motion fade-out timeout. */
    readonly fadeOut?: number;

    /** Start time in hours (for start-up motions only). */
    readonly time?: number;
}

export interface ExpressionDefinition {
    readonly name: string;

    /** `*.json` file. */
    readonly file: string;
}

export default class ModelSettings implements Tagged {
    tag = ModelSettings.name;

    readonly name?: string;

    // files
    readonly model: string = '';
    readonly pose?: string;
    readonly physics?: string;
    readonly subtitle?: string;
    readonly textures: string[] = [];

    // metadata
    readonly layout?: { [id: string]: number };
    readonly hitAreas?: { name: string; id: string }[];
    readonly initParams?: [{ id: string; value: number }];
    readonly initOpacities?: [{ id: string; value: number }];

    // motions
    readonly expressions?: ExpressionDefinition[];
    readonly motions: { [group: string]: MotionDefinition[] } = {};

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
    }

    /**
     * Validates and copies properties from JSON.
     */
    private copy(json: any) {
        // begin essential properties

        copyProperty(this, json, 'model', 'string');

        if (!this.model) {
            throw new TypeError('Missing model file.');
        }

        if (json.textures) {
            this.textures.push(...json.textures.filter((file: any) => typeof file === 'string'));
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
            // @ts-ignore
            this.layout = {};

            // copy only the number properties
            for (const [key, value] of Object.entries(json.layout)) {
                if (!isNaN(value as number)) {
                    this.layout[key] = value as number;
                }
            }
        }

        if (Array.isArray(json.hitAreas)) {
            const filter = (hitArea: any) => typeof hitArea.name === 'string' && typeof hitArea.id === 'string';
            // @ts-ignore
            this.hitAreas = json.hitAreas.filter(filter);
        }

        if (Array.isArray(json.expressions)) {
            const filter = (exp: any) => typeof exp.name === 'string' && typeof exp.file === 'string';
            // @ts-ignore
            this.expressions = json.expressions.filter(filter);
        }

        if (Array.isArray(json.initParam)) {
            const filter = (param: any) => typeof param.id === 'string' && typeof param.value === 'string';
            // @ts-ignore
            this.initParams = json.initParam.filter(filter);
        }

        if (Array.isArray(json.initPartsVisible)) {
            const filter = (param: any) => typeof param.id === 'string' && typeof param.value === 'string';
            // @ts-ignore
            this.initOpacities = json.initPartsVisible.filter(filter);
        }

        if (json.motions && typeof json.motions === 'object') {
            for (const [group, motionGroup] of Object.entries(json.motions)) {
                if (Array.isArray(motionGroup)) {
                    this.motions[group] = motionGroup

                        // filter out the motions without `file` defined
                        .filter(motion => motion && typeof motion.file === 'string')

                        // copy only the valid properties
                        .map((motion: any) => {
                            const copy: MotionDefinition = {
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
        const convertProperty = (obj: object, propertyPath: string | number) => {
            const path: string = get(obj, propertyPath);

            if (path) {
                set(obj, propertyPath, urlResolve(basePath, path));
            }
        };
        const convertArray = (obj: object, arrayPath: string, propertyPath: string) => {
            const array: [] = get(obj, arrayPath);

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

        Object.keys(this.motions).forEach(group => {
            convertArray(this.motions, group, 'file');
            convertArray(this.motions, group, 'sound');
        });

        if (Array.isArray(this.textures)) {
            this.textures.forEach((texture, i) => convertProperty(this.textures, i));
        }
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

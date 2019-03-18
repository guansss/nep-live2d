import { cloneWithCamelCase } from '@/core/utils/misc';

const enum ParamCalcType {
    Set = 'set',
    Add = 'add',
    Mult = 'mult',
}

interface Param {
    id: string;
    value: number;
    type: ParamCalcType;
}

const DEFAULT_FADE_TIMEOUT = 500;

export default class Live2DExpression extends AMotion {
    readonly params: Param[] = [];

    constructor(json: object) {
        super();

        this.load(cloneWithCamelCase(json));
    }

    private load(json: any) {
        this.setFadeIn(json.fadeIn > 0 ? json.fadeIn : DEFAULT_FADE_TIMEOUT);
        this.setFadeOut(json.fadeOut > 0 ? json.fadeOut : DEFAULT_FADE_TIMEOUT);

        if (Array.isArray(json.params)) {
            json.params.forEach((paramDef: any) => {
                const id = paramDef.id;
                let value = parseFloat(paramDef.val);

                if (!id || !value) {
                    // skip if missing essential properties
                    return;
                }

                const type = paramDef.calc || ParamCalcType.Add;

                if (type === ParamCalcType.Add) {
                    const defaultValue = parseFloat(paramDef.def) || 0;
                    value -= defaultValue;
                } else if (type === ParamCalcType.Mult) {
                    const defaultValue = parseFloat(paramDef.def) || 1;
                    value /= defaultValue;
                }

                this.params.push({
                    id,
                    value,
                    type,
                });
            });
        }
    }

    /** @override */
    updateParamExe(model: Live2DModelJS, time: DOMTimeStamp, weight: number, MotionQueueEnt: unknown) {
        this.params.forEach(param => {
            switch (param.type) {
                case ParamCalcType.Set:
                    model.setParamFloat(param.id, param.value, weight);
                    break;
                case ParamCalcType.Add:
                    model.addToParamFloat(param.id, param.value, weight);
                    break;
                case ParamCalcType.Mult:
                    model.multParamFloat(param.id, param.value, weight);
                    break;
            }
        });
    }
}

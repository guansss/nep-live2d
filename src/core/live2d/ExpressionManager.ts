import Live2DExpression from '@/core/live2d/Live2DExpression';
import { ExpressionDefinition } from '@/core/live2d/ModelSettings';
import { error, log } from '@/core/utils/log';
import { getJSON } from '@/core/utils/net';
import sample from 'lodash/sample';

export default class ExpressionManager extends MotionQueueManager {
    tag: string;

    private readonly internalModel: Live2DModelWebGL;

    private readonly definitions: ExpressionDefinition[];
    private readonly expressions: Live2DExpression[] = [];

    private defaultExpression = new Live2DExpression({}, 'default');
    private currentExpression = this.defaultExpression;

    constructor(name: string, model: Live2DModelWebGL, definitions: ExpressionDefinition[]) {
        super();

        this.tag = `ExpressionManager\n(${name})`;
        this.internalModel = model;
        this.definitions = definitions;

        this.loadExpressions().then();
        this.stopAllMotions();
    }

    private async loadExpressions() {
        for (const { name, file } of this.definitions) {
            try {
                const json = await getJSON(file);
                this.expressions.push(new Live2DExpression(json, name));
            } catch (e) {
                error(this.tag, `Failed to load expression [${name}]: ${file}`, e);
            }
        }

        this.expressions.push(this.defaultExpression); // at least put a normal expression
    }

    setRandomExpression() {
        if (this.expressions.length == 1) {
            this.setExpression(this.expressions[0]);
        } else {
            let expression;

            // prevent showing same expression twice
            do {
                expression = sample(this.expressions);
            } while (expression == this.currentExpression);

            this.setExpression(expression!);
        }
    }

    resetExpression() {
        this.startMotion(this.defaultExpression);
    }

    restoreExpression() {
        this.startMotion(this.currentExpression);
    }

    setExpression(expression: Live2DExpression) {
        log(this.tag, 'Set expression:', expression.name);

        this.currentExpression = expression;
        this.startMotion(expression);
    }

    update() {
        if (!this.isFinished()) {
            return this.updateParam(this.internalModel);
        }
    }
}

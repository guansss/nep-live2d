import Live2DExpression from '@/core/live2d/Live2DExpression';
import { ExpressionDefinition } from '@/core/live2d/ModelSettings';
import logger, { Logger } from '@/core/utils/log';
import { getJSON } from '@/core/utils/net';
import { sample } from 'lodash';

export default class ExpressionManager extends MotionQueueManager {
    private readonly model: Live2DModelWebGL;

    private readonly definitions: ExpressionDefinition[];
    private readonly expressions: Live2DExpression[] = [];

    private defaultExpression = new Live2DExpression({});
    private currentExpression = this.defaultExpression;

    private readonly log: Logger;

    constructor(name: string, model: Live2DModelWebGL, definitions: ExpressionDefinition[]) {
        super();

        this.model = model;
        this.definitions = definitions;
        this.log = logger(`${ExpressionManager.name}(${name})`);

        this.loadExpressions().then();
        this.stopAllMotions();
    }

    private async loadExpressions() {
        this.definitions.forEach(async ({ name, file }) => {
            try {
                this.log(`Loading expression [${name}]`);
                const json = await getJSON(file);
                this.expressions.push(new Live2DExpression(json, name));
            } catch (e) {
                this.log.error(`Failed to load expression [${name}]: ${file}`, e);
            }
        });
    }

    resetExpression() {
        this.setExpression(this.defaultExpression);
    }

    restoreExpression() {
        this.setExpression(this.currentExpression);
    }

    setRandomExpression() {
        if (this.expressions && this.expressions.length > 0) {
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
    }

    setExpression(expression: Live2DExpression) {
        this.currentExpression = expression;
        this.startMotion(expression);
    }
}

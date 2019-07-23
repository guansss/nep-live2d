import Live2DExpression from '@/core/live2d/Live2DExpression';
import ModelSettings from '@/core/live2d/ModelSettings';
import logger, { Logger } from '@/core/utils/log';
import { getArrayBuffer, getJSON } from '@/core/utils/net';
import { randomID } from '@/core/utils/string';

enum Priority {
    None,
    Idle,
    Normal,
    Force,
}

export default class MotionManager extends MotionQueueManager {
    static readonly Priority = Priority;

    private readonly model: Live2DModelWebGL;

    private readonly motions: { [group: string]: Live2DMotion[] } = {};

    private readonly expressions: { name: string; expression: Live2DExpression }[] = [];

    private currentPriority = Priority.None;
    private reservePriority = Priority.None;

    private readonly log: Logger;

    constructor(model: Live2DModelWebGL, modelSettings: ModelSettings) {
        super();

        this.model = model;
        this.log = logger(MotionManager.name + (modelSettings.name || randomID()));

        this.loadMotions(modelSettings).then();
        this.loadExpressions(modelSettings).then();

        this.stopAllMotions();
    }

    private async loadMotions(modelSettings: ModelSettings) {
        if (!modelSettings.motions) {
            return;
        }

        Object.entries(modelSettings.motions).forEach(([group, motionDefs]) => {
            this.motions[group] = [];

            motionDefs.forEach(async ({ name, file }) => {
                try {
                    const buffer = await getArrayBuffer(file);

                    this.motions[group].push(Live2DMotion.loadMotion(buffer));
                } catch (e) {
                    this.log.error(`Failed to load motion [${name}]: ${file}`, e);
                }
            });
        });
    }

    private async loadExpressions(modelSettings: ModelSettings) {
        if (!modelSettings.expressions) {
            return;
        }

        modelSettings.expressions.forEach(async ({ name, file }) => {
            try {
                const json = await getJSON(file);

                this.expressions.push({
                    name,
                    expression: new Live2DExpression(json),
                });
            } catch (e) {
                this.log.error(`Failed to load expression [${name}]: ${file}`, e);
            }
        });
    }

    /**
     * @returns True if succeeded
     */
    reserveMotion(priority: Priority) {
        if (priority <= this.currentPriority || priority <= this.reservePriority) {
            return false;
        }

        this.reservePriority = priority;
        return true;
    }

    startMotion(motion: Live2DMotion, priority: Priority) {
        if (priority === this.reservePriority) {
            this.reservePriority = 0;
        }
        this.currentPriority = priority;
        return MotionQueueManager.prototype.startMotion.call(this, motion, false);
    }

    update() {
        const updated = this.updateParam(this.model);

        if (this.isFinished()) {
            this.currentPriority = 0;
        }

        return updated;
    }
}

import ExpressionManager from '@/core/live2d/ExpressionManager';
import { ExpressionDefinition, MotionDefinition } from '@/core/live2d/ModelSettings';
import { error, log, Tagged } from '@/core/utils/log';
import { getArrayBuffer } from '@/core/utils/net';

export enum Priority {
    None = 0,
    Idle = 1,
    Normal = 2,
    Force = 3,
}

enum Group {
    Idle = 'idle',
}

const DEFAULT_FADE_TIMEOUT = 500;

export default class MotionManager extends MotionQueueManager implements Tagged {
    static readonly Priority = Priority;

    tag: string;

    readonly internalModel: Live2DModelWebGL;

    definitions: { [group: string]: MotionDefinition[] };
    motionGroups: { [group: string]: Live2DMotion[] } = {};

    expressionManager?: ExpressionManager;

    currentPriority = Priority.None;

    constructor(
        name: string,
        model: Live2DModelWebGL,
        motionDefinitions: { [group: string]: MotionDefinition[] },
        expressionDefinitions?: ExpressionDefinition[],
    ) {
        super();

        this.tag = `${MotionManager.name}(${name})`;
        this.internalModel = model;
        this.definitions = motionDefinitions;

        if (expressionDefinitions) {
            this.expressionManager = new ExpressionManager(name, model!, expressionDefinitions);
        }

        this.loadMotions().then();

        this.stopAllMotions();
    }

    private async loadMotions() {
        // initialize all motion groups with empty arrays
        Object.keys(this.definitions).forEach(group => (this.motionGroups[group] = []));

        // preload idle motions
        if (this.definitions[Group.Idle]) {
            for (let i = this.definitions[Group.Idle].length - 1; i >= 0; i--) {
                this.loadMotion(Group.Idle, i).then();
            }
        }
    }

    private async loadMotion(group: string, index: number) {
        log(this, `Loading motion at ${index} in group "${group}"`);

        const definition = this.definitions[group] && this.definitions[group][index];

        if (!definition) {
            error(this, 'Motion not found');
            return;
        }

        log(this, `Loading motion [${definition.name}]`);

        try {
            const buffer = await getArrayBuffer(definition.file);
            const motion = Live2DMotion.loadMotion(buffer);
            motion.setFadeIn(definition.fadeIn! > 0 ? definition.fadeIn! : DEFAULT_FADE_TIMEOUT);
            motion.setFadeOut(definition.fadeOut! > 0 ? definition.fadeOut! : DEFAULT_FADE_TIMEOUT);

            this.motionGroups[group][index] = motion;
            return motion;
        } catch (e) {
            error(this, `Failed to load motion [${definition.name}]: ${definition.file}`, e);
        }
    }

    async startMotionByPriority(group: string, index: number, priority: Priority = Priority.Normal) {
        if (priority <= this.currentPriority) {
            log(this, 'Cannot start motion because another motion of higher priority is running');
            return;
        }
        this.currentPriority = priority;

        if (priority > Priority.Idle) {
            this.expressionManager && this.expressionManager.resetExpression();
        }

        const motion =
            (this.motionGroups[group] && this.motionGroups[group][index]) || (await this.loadMotion(group, index));
        if (!motion) return;

        const definition = this.definitions[group][index];
        log(this, 'Starting motion:', definition);

        this.startMotion(motion);
    }

    startRandomMotion(group: string, priority: Priority = Priority.Normal) {
        const groupDefinitions = this.definitions[group];

        if (groupDefinitions && groupDefinitions.length > 0) {
            const index = Math.floor(Math.random() * groupDefinitions.length);
            this.startMotionByPriority(group, index, priority).then();
        }
    }

    update() {
        if (this.isFinished()) {
            if (this.currentPriority > Priority.Idle) {
                this.expressionManager && this.expressionManager.restoreExpression();
            }
            this.currentPriority = Priority.None;
            this.startRandomMotion(Group.Idle, Priority.Idle);
        }

        const updated = this.updateParam(this.internalModel);

        this.expressionManager && this.expressionManager.update();

        return updated;
    }
}

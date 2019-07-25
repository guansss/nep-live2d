import ExpressionManager from '@/core/live2d/ExpressionManager';
import { ExpressionDefinition, MotionDefinition } from '@/core/live2d/ModelSettings';
import logger, { Logger } from '@/core/utils/log';
import { getArrayBuffer } from '@/core/utils/net';

enum Priority {
    None = 0,
    Idle = 1,
    Normal = 2,
    Force = 3,
}

enum Group {
    Idle = 'idle',
}

export default class MotionManager extends MotionQueueManager {
    static readonly Priority = Priority;

    readonly expressionManager: ExpressionManager;

    readonly model: Live2DModelWebGL;

    readonly definitions: { [group: string]: MotionDefinition[] };

    readonly motions: { [group: string]: Live2DMotion[] } = {};

    currentPriority = Priority.None;

    readonly log: Logger;

    constructor(
        name: string,
        model: Live2DModelWebGL,
        motionDefinitions: { [group: string]: MotionDefinition[] },
        expressionDefinitions: ExpressionDefinition[],
    ) {
        super();

        this.model = model;
        this.definitions = motionDefinitions;

        this.expressionManager = new ExpressionManager(name, model!, expressionDefinitions);
        this.log = logger(`${MotionManager.name}(${name})`);

        this.loadMotions().then();

        this.stopAllMotions();
    }

    private async loadMotions() {
        // initialize all motion groups with empty arrays
        Object.keys(this.definitions).forEach(group => (this.motions[group] = []));

        // preload idle motions
        if (this.definitions[Group.Idle]) {
            for (let i = this.definitions[Group.Idle].length - 1; i >= 0; i--) {
                this.loadMotion(Group.Idle, i).then();
            }
        }
    }

    private async loadMotion(group: string, index: number) {
        this.log(`Loading motion at ${index} in group "${group}"`);

        const definition = this.definitions[group] && this.definitions[group][index];

        if (!definition) {
            this.log.error('Motion not found');
            return;
        }

        this.log(`Loading motion [${definition.name}]`);

        try {
            const buffer = await getArrayBuffer(definition.file);
            const motion = Live2DMotion.loadMotion(buffer);

            this.motions[group][index] = motion;
            return motion;
        } catch (e) {
            this.log.error(`Failed to load motion [${definition.name}]: ${definition.file}`, e);
        }
    }

    async startMotionByPriority(group: string, index: number, priority: Priority = Priority.Normal) {
        if (priority <= this.currentPriority) {
            this.log('Cannot start motion because another motion of higher priority is running');
            return;
        }
        this.currentPriority = priority;

        if (priority > Priority.Idle) {
            this.expressionManager.resetExpression();
        }

        let motion = this.motions[group] && (this.motions[group][index] || (await this.loadMotion(group, index)));
        if (!motion) return;

        const definition = this.definitions[group][index];
        this.log('Starting motion:', definition);

        this.startMotion(motion);
    }

    startRandomMotion(group: Group, priority: Priority = Priority.Normal) {
        const groupDefinitions = this.definitions[group];

        if (groupDefinitions && groupDefinitions.length > 0) {
            const index = Math.floor(Math.random() * groupDefinitions.length);
            this.startMotionByPriority(group, index, priority).then();
        }
    }

    update() {
        if (this.isFinished()) {
            this.currentPriority = Priority.None;
            this.expressionManager.restoreExpression();
            this.startRandomMotion(Group.Idle, Priority.Idle);
        }

        return this.updateParam(this.model);
    }
}

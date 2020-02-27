import { EventEmitter } from '@pixi/utils';
import Live2DSprite from '../live2d/Live2DSprite';

export default function registerHitEvent(sprite: Live2DSprite) {
    (sprite as EventEmitter).on('hit', (hitAreaName: string) => {
        const expressionManager = sprite.model.motionManager.expressionManager;

        switch (hitAreaName) {
            case 'head':
                expressionManager && expressionManager.setRandomExpression();
                break;

            case 'body':
            case 'belly':
                sprite.model.motionManager.startRandomMotion('tapBody');
                break;
        }
    });
}

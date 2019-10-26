import { THEMES } from '@/defaults';
import { Config } from '../config/ConfigModule';
import Live2DSprite from '../live2d/Live2DSprite';

export default function greet(sprite: Live2DSprite, config: Config) {
    const definitions = sprite.model.motionManager.definitions;

    if (definitions['greet']) {
        const theme = THEMES[config.get('theme.selected', -1)];

        if (theme && theme.season) {
            const index = definitions['greet'].findIndex(def => def.season === theme.season);

            if (index !== -1) sprite.model.motionManager.startMotionByPriority('greet', index).then();
        }
    }
}

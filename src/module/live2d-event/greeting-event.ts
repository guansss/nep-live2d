import { THEMES } from '@/defaults';
import { Config } from '../config/ConfigModule';
import Live2DSprite from '../live2d/Live2DSprite';

export default function greet(sprite: Live2DSprite, config: Config) {
    const definitions = sprite.model.motionManager.definitions['greet'];

    if (definitions && definitions.length !== 0) {
        const theme = THEMES[config.get('theme.selected', -1)];
        let index = -1;

        if (theme && theme.season) {
            index = definitions.findIndex(def => def.season === theme.season);
        }

        if (index === -1) {
            const indices: number[] = [];
            const hours = new Date().getHours();
            let min = 24;
            let dt;

            // find a timed greeting motion closest the current hours
            for (let i = definitions.length - 1; i >= 0; i--) {
                if (!isNaN(definitions[i].time as number)) {
                    dt = hours - definitions[i].time!;

                    if (dt >= 0 && dt <= min) {
                        if (dt === min) {
                            indices.push(i);
                        } else {
                            min = dt;
                            indices.splice(0, indices.length, i);
                        }
                    }
                }
            }

            if (indices.length !== 0) {
                index = ~~(Math.random() * indices.length);
            } else {
                // start a random non-seasonal greeting motion
                const nonSeasonalIndices = Array.from(definitions.keys()).filter(i => !definitions[i].season);

                if (nonSeasonalIndices.length !== 0) {
                    index = nonSeasonalIndices[~~(Math.random() * nonSeasonalIndices.length)];
                }
            }
        }

        if (index !== -1) sprite.model.motionManager.startMotionByPriority('greet', index).then();
    }
}

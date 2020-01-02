import Player from '@/core/mka/Player';
import Ticker from '@/core/mka/Ticker';
import { log } from '@/core/utils/log';
import { Z_INDEX_LEAVES, Z_INDEX_LEAVES_BACK } from '@/defaults';
import Leaves, { DEFAULT_OPTIONS as LEAVES_DEFAULT_OPTIONS } from '@/module/leaves/Leaves';
import { Loader } from '@pixi/loaders';

// TODO: Import the JSON and copy related image
const LEAVES_SOURCE = 'sheet/leaves.json';

const TAG = 'LeavesPlayer';

export default class LeavesPlayer extends Player {
    leaves?: Leaves;
    backLeaves?: Leaves;

    private textureLoadingPromise?: Promise<PIXI.Texture[]>;

    private _number = LEAVES_DEFAULT_OPTIONS.number;
    private _layering = false;

    get number() {
        return this._number;
    }

    set number(value: number) {
        this._number = value;
        this.setup().then();
    }

    get layering() {
        return this._layering;
    }

    set layering(value: boolean) {
        this._layering = value;
        this.setup().then();
    }

    private loadTextures(): Promise<PIXI.Texture[]> {
        if (!this.textureLoadingPromise) {
            this.textureLoadingPromise = new Promise(resolve => {
                log(TAG, 'Loading texture:', LEAVES_SOURCE);

                new Loader()
                    .add(LEAVES_SOURCE, { crossOrigin: true })
                    .load((loader: Loader, resources: Partial<Record<string, PIXI.LoaderResource>>) => {
                        resolve(Object.values(resources[LEAVES_SOURCE]!.spritesheet!.textures));
                    });
            });
        }

        return this.textureLoadingPromise;
    }

    private async setup() {
        if (!this.enabled) return;

        const textures = await this.loadTextures();

        if (!this.enabled) return;

        if (!this.leaves) {
            this.leaves = this.createLeaves(textures);
            this.leaves.zIndex = Z_INDEX_LEAVES;
        }

        if (this._layering) {
            this.leaves.number = ~~(this._number / 2);

            if (!this.backLeaves) {
                this.backLeaves = this.leaves.clone();
                this.backLeaves.zIndex = Z_INDEX_LEAVES_BACK;
            }
        } else {
            this.leaves.number = this._number;

            if (this.backLeaves) {
                this.destroyLeaves(this.backLeaves);
                this.backLeaves = undefined;
            }
        }

        if (this.mka) {
            const pixiApp = this.mka.pixiApp;

            const width = pixiApp.renderer.width;
            const height = pixiApp.renderer.height;

            this.leaves.resize(width, height);

            if (!pixiApp.stage.children.includes(this.leaves)) {
                pixiApp.stage.addChild(this.leaves);
            }

            if (this.backLeaves) {
                this.backLeaves.resize(width, height);

                if (!pixiApp.stage.children.includes(this.backLeaves)) {
                    pixiApp.stage.addChild(this.backLeaves);
                }
            }
        }
    }

    private createLeaves(textures: PIXI.Texture[]): Leaves {
        let width = 100;
        let height = 100;

        if (this.mka) {
            const renderer = this.mka.pixiApp.renderer;
            width = renderer.width;
            height = renderer.height;
        }

        return new Leaves(textures, {
            width,
            height,
            minSize: 10,
            maxSize: 100,
            number: this._number,
        });
    }

    private destroyLeaves(leaves: Leaves) {
        if (this.mka) {
            if (this.mka.pixiApp.stage.children.includes(leaves)) {
                this.mka.pixiApp.stage.removeChild(leaves);
            }
        }

        leaves.destroy();
    }

    attach() {
        this.mka!.pixiApp.stage.on('hit', this.hit, this);
        this.setup().then();
    }

    detach() {
        this.destroy();
    }

    enable() {
        this.setup().then();
    }

    disable() {
        this.destroy();
    }

    hit(x: number, y: number) {
        this.leaves && this.leaves.hit(x, y);
        this.backLeaves && this.backLeaves.hit(x, y);
    }

    update(): boolean {
        let updated = false;

        if (this.leaves) {
            this.leaves.update(Ticker.delta, Ticker.now);

            updated = true;
        }

        if (this.backLeaves) {
            this.backLeaves.update(Ticker.delta, Ticker.now);

            updated = true;
        }

        return updated;
    }

    destroy() {
        if (this.mka) {
            this.mka.pixiApp.stage.off('hit', this.hit);
        }

        if (this.leaves) {
            this.destroyLeaves(this.leaves);
            this.leaves = undefined;
        }

        if (this.backLeaves) {
            this.destroyLeaves(this.backLeaves);
            this.backLeaves = undefined;
        }
    }
}

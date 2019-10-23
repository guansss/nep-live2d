import Player from '@/core/mka/Player';
import Leaves from '@/module/leaves/Leaves';

// TODO: Import the JSON and copy related image
const LEAVES = 'sheet/leaves.json';

const TAG = 'LeavesPlayer';

export default class LeavesPlayer extends Player {
    private leaves?: Leaves;

    private _number = 0;

    get number() {
        return this.leaves ? this.leaves.number : this._number;
    }

    set number(value: number) {
        this._number = value;
        this.leaves && (this.leaves.number = value);
    }

    private setup() {
        if (!this.enabled) return;

        if (!this.leaves) {
            let width = 100;
            let height = 100;

            if (this.mka) {
                const renderer = this.mka.pixiApp.renderer;
                width = renderer.width;
                height = renderer.height;
            }

            this.leaves = new Leaves(LEAVES, {
                width,
                height,
                number: this._number,
                minSize: 10,
                maxSize: 100,
            });
        }

        if (this.mka) {
            const pixiApp = this.mka.pixiApp;

            pixiApp.stage.on('hit', this.hit, this);

            if (!pixiApp.stage.children.includes(this.leaves!)) {
                if (pixiApp.renderer.width !== this.leaves.width || pixiApp.renderer.height !== this.leaves.height) {
                    this.leaves.resize(pixiApp.renderer.width, pixiApp.renderer.height);
                }
                this.mka.pixiApp.stage.addChild(this.leaves!);
            }
        }
    }

    attach() {
        this.setup();
    }

    detach() {
        this.destroy();
    }

    enable() {
        this.setup();
    }

    disable() {
        this.destroy();
    }

    hit(x: number, y: number) {
        this.leaves && this.leaves.hit(x, y);
    }

    update(): boolean {
        if (this.leaves) {
            // TODO: calculate dt and now
            this.leaves.update(16, performance.now());

            return true;
        }
        return false;
    }

    destroy() {
        if (this.leaves) {
            if (this.mka) {
                this.mka.pixiApp.stage.off('hit', this.hit);

                if (this.mka.pixiApp.stage.children.includes(this.leaves!)) {
                    this.mka.pixiApp.stage.removeChild(this.leaves!);
                }
            }

            this.leaves.destroy();
            this.leaves = undefined;
        }
    }
}

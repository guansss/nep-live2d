import Draggable from '@/core/utils/Draggable';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

@Component
export default class FloatingPanelMixin extends Vue {
    // Refs
    readonly panel!: HTMLElement;
    readonly content!: HTMLElement;
    readonly handle!: HTMLElement;

    expanded = false;

    switchTop = 0;
    switchLeft = 0;
    switchWidth = 64;
    switchHeight = 64;
    switchBorderRadius = '50%';

    panelTop = 0;
    panelLeft = 0;
    panelWidth = 400;
    panelHeight = 300;
    panelBorderRadius = '4px';

    animDuration = 300;

    // when will the state change from switch to panel during animation
    stateChangeFraction = 0.4;

    get style() {
        // must access dependencies explicitly
        // @see http://optimizely.github.io/vuejs.org/guide/computed.html

        const switchStyle = {
            top: this.switchTop + 'px',
            left: this.switchLeft + 'px',
            width: this.switchWidth + 'px',
            height: this.switchHeight + 'px',
        };
        const panelStyle = {
            top: this.panelTop + 'px',
            left: this.panelLeft + 'px',
            width: this.panelWidth + 'px',
            height: this.panelHeight + 'px',
        };
        return this.expanded ? panelStyle : switchStyle;
    }

    @Watch('expanded')
    expandedChanged(expanded: boolean, wasExpanded: boolean) {
        // Since the content is conditional on `expanded` with `v-if`, its element will be dynamically create and destroy
        //  every time the dependency changes, we need to do works right after it create and recreates.
        this.$nextTick(this.setupContent);
    }

    protected mounted() {
        this.panel.style.transformOrigin = '0 0';
        this.panel.style.borderRadius = this.switchBorderRadius;
        this.panel.classList.add('switch');

        this.setupPanel();
        this.setupContent();
    }

    private setupPanel() {
        // setup draggable for switch mode
        const draggable = new Draggable(this.panel, undefined, 2);

        draggable.onStart = (e: MouseEvent) => {
            // prevent the click event (maybe)
            e.preventDefault();
            return true;
        };

        draggable.onDrag = (e: MouseEvent) => {
            this.switchTop += e._movementY;
            this.switchLeft += e._movementX;
            return true;
        };

        draggable.onEnd = (e: MouseEvent) => {
            this.switchMoveEnded();

            if (!draggable.dragged && !this.expanded) this.open();
        };
    }

    private setupContent() {
        if (this.content) {
            // setup draggable for panel mode
            const draggable = new Draggable(this.handle, undefined, 2);

            draggable.onDrag = (e: MouseEvent) => {
                this.panelTop += e._movementY;
                this.panelLeft += e._movementX;
                return true;
            };

            draggable.onEnd = () => this.panelMoveEnded();
        }
    }

    open() {
        if (!this.expanded) {
            // FLIP animation.
            // First set to end state, then animate from start state to end state.
            // see https://css-tricks.com/animating-layouts-with-the-flip-technique/

            const distanceX = this.panel.offsetLeft - this.panelLeft;
            const distanceY = this.panel.offsetTop - this.panelTop;
            const scaleX = this.panel.offsetWidth / this.panelWidth;
            const scaleY = this.panel.offsetHeight / this.panelHeight;

            this.panel.classList.remove('switch');
            this.panel.classList.add('panel');

            this.panel.style.borderRadius = this.panelBorderRadius;

            this.expanded = true;

            this.panel.animate(
                [
                    {
                        borderRadius: this.switchBorderRadius,
                        transform: `translateX(${distanceX}px) translateY(${distanceY}px) scaleX(${scaleX}) scaleY(${scaleY})`,
                    },
                    { borderRadius: this.panelBorderRadius, offset: this.stateChangeFraction },
                    { borderRadius: this.panelBorderRadius, transform: 'none' },
                ],
                {
                    duration: this.animDuration,
                    easing: 'ease-out',
                },
            );

            // wait for `this.content` to be rendered
            this.$nextTick(() => {
                this.content.style.opacity = '1';

                this.content.animate(
                    [{ opacity: 0 }, { opacity: 1, offset: this.stateChangeFraction }, { opacity: 1 }],
                    {
                        duration: this.animDuration,
                        easing: 'ease-out',
                    },
                );
            });
        }
    }

    close() {
        if (this.expanded) {
            // This one is not FLIP animation but probably some kind of its reverse.
            // First animate from start state to end state, then set to end state.

            const distanceX = this.switchLeft - this.panel.offsetLeft;
            const distanceY = this.switchTop - this.panel.offsetTop;
            const scaleX = this.switchWidth / (this.panel.offsetWidth || Infinity);
            const scaleY = this.switchHeight / (this.panel.offsetHeight || Infinity);

            this.panel.style.borderRadius = this.switchBorderRadius;
            this.content.style.opacity = '0';

            this.panel.animate(
                [
                    { borderRadius: this.panelBorderRadius, transform: 'none' },
                    { borderRadius: this.panelBorderRadius, offset: 0.7 },
                    {
                        borderRadius: this.switchBorderRadius,
                        transform: `translateX(${distanceX}px) translateY(${distanceY}px) scaleX(${scaleX}) scaleY(${scaleY})`,
                    },
                ],
                {
                    duration: this.animDuration,
                    easing: 'ease-out',
                },
            ).onfinish = () => {
                this.panel.classList.remove('panel');
                this.panel.classList.add('switch');

                this.expanded = false;
            };

            this.content.animate(
                [{ opacity: 1 }, { opacity: 1, offset: 1 - this.stateChangeFraction }, { opacity: 0 }],
                {
                    duration: this.animDuration,
                    easing: 'ease-out',
                },
            );
        }
    }

    // To be overridden
    protected switchMoveEnded() {}

    // To be overridden
    protected panelMoveEnded() {}
}

import Draggable from '@/core/utils/Draggable';
import { clamp } from '@/core/utils/math';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

// https://material.io/design/motion/speed.html#easing
const TRANSFORM_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';

const SNAP_DISTANCE_X = 150;
const SNAP_DISTANCE_Y = 150;

const PANEL_WIDTH = Math.min(600, innerWidth);
const PANEL_HEIGHT = Math.min(450, innerHeight);

@Component
export default class FloatingPanelMixin extends Vue {
    // Refs
    readonly panel!: HTMLElement;
    readonly content!: HTMLElement;
    readonly handle!: HTMLElement;
    readonly resizer!: HTMLElement;

    expanded = false;

    stateClass = 'switch';
    snapped = false;

    switchTop = innerHeight / 2 - 32;
    switchLeft = innerWidth / 2 - 32;
    switchWidth = 64;
    switchHeight = 64;
    switchBorderRadius = '50%';
    switchTransform = '';

    panelTop = (innerHeight - PANEL_HEIGHT) / 2; // center in screen
    panelLeft = (innerWidth - PANEL_WIDTH) / 2;
    panelWidth = PANEL_WIDTH;
    panelHeight = PANEL_HEIGHT;
    panelBorderRadius = '0';

    // a flag to tell the children if they should display its content
    contentVisible = false;

    transformAnimDuration = 300;

    // when will the state change between switch and panel during animation
    stateChangeFraction = 0.3;

    get panelStyle() {
        // must access dependencies explicitly
        // @see http://optimizely.github.io/vuejs.org/guide/computed.html

        const switchStyle = {
            top: this.switchTop + 'px',
            left: this.switchLeft + 'px',
            width: this.switchWidth + 'px',
            height: this.switchHeight + 'px',
            transform: this.switchTransform,
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
    expandedChanged(expanded: boolean) {
        if (expanded) {
            // Since the content is conditional on `expanded` with `v-if`, its element will be dynamically created and destroyed
            //  every time the dependency changes, we need to do works right after it's created and recreated.
            this.$nextTick(this.setupContent);
        }
    }

    protected mounted() {
        this.setupPanel();
        this.setupContent();

        // wait for component's `mounted()`
        this.$nextTick(() => this.snapSwitch(false));
    }

    private setupPanel() {
        this.panel.style.transformOrigin = '0 0';
        this.panel.style.borderRadius = this.switchBorderRadius;

        // setup draggable for switch mode
        const draggable = new Draggable(this.panel, undefined, 2);

        draggable.onDrag = (e: MouseEvent) => {
            this.switchTop += e._movementY;
            this.switchLeft += e._movementX;
            return true;
        };

        draggable.onEnd = () => {
            this.switchMoveEnded();

            if (draggable.dragged) {
                this.snapSwitch(true);
            } else if (!this.expanded) {
                this.open();
            }
        };
    }

    private setupContent() {
        // setup draggable for panel mode
        if (this.content) {
            const handleDraggable = new Draggable(this.handle, undefined, 2, false);

            handleDraggable.onDrag = (e: MouseEvent) => {
                this.panelTop += e._movementY;
                this.panelLeft += e._movementX;
                return true;
            };

            handleDraggable.onEnd = () => this.panelMoveEnded();

            const resizerDraggable = new Draggable(this.resizer, undefined, 2);

            resizerDraggable.onDrag = (e: MouseEvent) => {
                const parent = this.panel.parentElement;
                this.panelWidth = clamp(
                    this.panelWidth + e._movementX,
                    50,
                    parent!.offsetWidth - this.panel.offsetLeft,
                );
                this.panelHeight = clamp(
                    this.panelHeight + e._movementY,
                    50,
                    parent!.offsetHeight - this.panel.offsetTop,
                );
                return true;
            };

            resizerDraggable.onEnd = () => this.panelResizeEnded();
        }
    }

    snapSwitch(animate: boolean) {
        const parent = this.panel.parentElement;
        if (!parent) return;

        const centerX = this.switchLeft + this.switchWidth / 2;
        const centerY = this.switchTop + this.switchHeight / 2;

        const snapDistanceX = Math.min(SNAP_DISTANCE_X, parent.offsetWidth / 2);
        const snapDistanceY = Math.min(SNAP_DISTANCE_Y, parent.offsetHeight / 2);

        // top and bottom, left and right, both should never be true at the same time
        const snapTop = centerY < snapDistanceY;
        const snapBottom = centerY > parent.offsetHeight - snapDistanceY;
        const snapLeft = centerX < snapDistanceX;
        const snapRight = centerX > parent.offsetWidth - snapDistanceX;

        this.snapped = snapTop || snapBottom || snapLeft || snapRight;
        this.switchTransform = '';

        if (snapTop) {
            this.switchTop = 0;
            this.switchTransform += ' translateY(-50%)';
        }
        if (snapBottom) {
            // should have used `bottom: 0`, because otherwise resizing parent will break the snap, but, whatever
            this.switchTop = parent.offsetHeight - this.switchHeight;
            this.switchTransform += ' translateY(50%)';
        }
        if (snapLeft) {
            this.switchLeft = 0;
            this.switchTransform += ' translateX(-50%)';
        }
        if (snapRight) {
            // ditto
            this.switchLeft = parent.offsetWidth - this.switchWidth;
            this.switchTransform += ' translateX(50%)';
        }

        if (animate && this.snapped) {
            // FLIP animation
            const translateX = this.panel.offsetLeft - this.switchLeft;
            const translateY = this.panel.offsetTop - this.switchTop;

            if (translateX || translateY) {
                this.panel.animate(
                    [
                        { transform: `translateX(${translateX}px) translateY(${translateY}px)` },
                        { transform: this.switchTransform },
                    ],
                    {
                        duration: 300,
                        easing: 'ease-in-out',
                    },
                );
            }
        }
    }

    open() {
        if (!this.expanded) {
            // FLIP animation.
            // First set to end state, then animate from start state to end state.
            // see https://css-tricks.com/animating-layouts-with-the-flip-technique/

            const translateX = this.panel.offsetLeft - this.panelLeft;
            const translateY = this.panel.offsetTop - this.panelTop;
            const scaleX = this.panel.offsetWidth / this.panelWidth;
            const scaleY = this.panel.offsetHeight / this.panelHeight;

            this.expanded = true;
            this.stateClass = 'panel';

            this.panel.style.borderRadius = this.panelBorderRadius;

            // wait for `this.content` to be created and rendered
            this.$nextTick(() => {
                this.panel.animate(
                    [
                        {
                            borderRadius: this.switchBorderRadius,
                            transform: `translateX(${translateX}px) translateY(${translateY}px) scaleX(${scaleX}) scaleY(${scaleY})`,
                        },
                        { borderRadius: this.panelBorderRadius, offset: this.stateChangeFraction },
                        { borderRadius: this.panelBorderRadius, transform: 'none' },
                    ],
                    {
                        duration: this.transformAnimDuration,
                        easing: TRANSFORM_EASING,
                    },
                );

                this.content.animate(
                    [{ opacity: 0 }, { opacity: 1, offset: this.stateChangeFraction }, { opacity: 1 }],
                    {
                        duration: this.transformAnimDuration,
                        easing: TRANSFORM_EASING,
                    },
                ).onfinish = () => this.contentVisible = true;
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

            this.contentVisible = false;

            this.$nextTick(() => {
                this.panel.animate(
                    [
                        { borderRadius: this.panelBorderRadius, transform: 'none' },
                        { borderRadius: this.panelBorderRadius, offset: this.stateChangeFraction },
                        {
                            borderRadius: this.switchBorderRadius,
                            transform: `translateX(${distanceX}px) translateY(${distanceY}px) scaleX(${scaleX}) scaleY(${scaleY})`,
                        },
                    ],
                    {
                        duration: this.transformAnimDuration,
                        easing: TRANSFORM_EASING,
                    },
                ).onfinish = () => {
                    this.expanded = false;
                    this.stateClass = 'switch';
                };

                this.content.animate(
                    [{ opacity: 1 }, { opacity: 0, offset: this.stateChangeFraction }, { opacity: 0 }],
                    {
                        duration: this.transformAnimDuration,
                        easing: TRANSFORM_EASING,
                    },
                );
            });
        }
    }

    // To be overridden
    protected switchMoveEnded() {}

    protected panelMoveEnded() {}

    protected panelResizeEnded() {}
}

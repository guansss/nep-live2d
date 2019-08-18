import { Tagged } from '@/core/utils/log';
import autobind from 'autobind-decorator';
import { Cancelable, debounce, throttle } from 'lodash';

export default class MouseHandler implements Tagged {
    tag = MouseHandler.name;

    readonly element: HTMLElement;

    /** Only focus when mouse is pressed */
    private focusOnPress = false;

    /** How long will the focus last. Setting 0 or negative value is equivalent to `Infinity` */
    private lostFocusTimeout: DOMHighResTimeStamp = Infinity;

    private pressed = false;
    private dragging = false;

    constructor(element: HTMLElement) {
        this.element = element;

        this.addGeneralListeners();

        if (!this.focusOnPress) {
            this.addMouseMoveListener();
        }
    }

    addGeneralListeners() {
        this.element.addEventListener('mousedown', this.mouseDown, { passive: true });
        this.element.addEventListener('mouseup', this.mouseUp, { passive: true });
        this.element.addEventListener('mouseout', this.mouseOut, { passive: true });

        // maybe adding these will make it support mobile browsers?
        // (will also require handling 'touchmove' and ignoring `button` property for touch events)
        //
        // element.addEventListener('touchstart', e => this.mouseDown(e), { passive: true });
        // element.addEventListener('touchend', e => this.mouseUp(e), { passive: true });
    }

    removeGeneralListeners() {
        this.element.removeEventListener('mousedown', this.mouseDown);
        this.element.removeEventListener('mouseup', this.mouseUp);
        this.element.removeEventListener('mouseout', this.mouseOut);
    }

    addMouseMoveListener() {
        this.element.addEventListener('mousemove', this.mouseMove, { passive: true });
    }

    removeMouseMoveListener() {
        this.element.removeEventListener('mousemove', this.mouseMove);
    }

    @autobind
    mouseDown(e: MouseEvent) {
        // only handle left mouse button
        if (e.button !== 0) return;

        this.focus(e.clientX / this.element.offsetWidth, e.clientY / this.element.offsetHeight);

        this.pressed = true;
        this.dragging = false;

        if (this.focusOnPress) {
            this.addMouseMoveListener();
        } else {
            this.cancelLostFocus();
        }
    }

    mouseMove = throttle((e: MouseEvent) => {
        this.dragging = true;
        this.focus(e.clientX / this.element.offsetWidth, e.clientY / this.element.offsetHeight);

        if (!this.pressed && !this.focusOnPress) {
            this.lostFocus();
        }
    }, 100);

    @autobind
    mouseUp(e: MouseEvent) {
        // only handle left mouse button
        if (e.button !== 0) return;

        if (this.pressed) {
            this.pressed = false;

            if (this.focusOnPress) {
                this.removeMouseMoveListener();
                this.clearFocus();
            }

            // detect single click
            if (!this.dragging) {
                this.press(e.clientX / this.element.offsetWidth, e.clientY / this.element.offsetHeight);
            }
        }
    }

    /**
     * Will be triggered when cursor leaves the element
     */
    @autobind
    mouseOut(e: MouseEvent) {
        if (!this.focusOnPress) {
            this.clearFocus();
            this.mouseUp(e);
        }
    }

    // to be overridden
    focus(x: number, y: number) {}

    // to be overridden
    press(x: number, y: number) {}

    clearFocus() {}

    lostFocus: (() => void) | (() => void) & Cancelable = () => {
        // initialize self on first call
        this.updateLostFocus();
        this.lostFocus();
    };

    updateLostFocus() {
        this.cancelLostFocus();
        this.lostFocus = debounce(() => this.clearFocus(), this.lostFocusTimeout);
    }

    cancelLostFocus() {
        if ((this.lostFocus as (() => void) & Cancelable).cancel) {
            (this.lostFocus as (() => void) & Cancelable).cancel();
        }
    }

    setFocusOnPress(enabled: boolean) {
        if (this.focusOnPress != enabled) {
            this.focusOnPress = enabled;

            if (enabled) {
                this.removeMouseMoveListener();
                this.cancelLostFocus();
                this.clearFocus();
            } else {
                this.addMouseMoveListener();
            }
        }
    }

    setLostFocusTimeout(value: DOMHighResTimeStamp) {
        this.lostFocusTimeout = value > 0 ? value : Infinity;
        if (value === Infinity) {
            this.cancelLostFocus();
        } else {
            this.updateLostFocus();
        }
    }

    destroy() {
        this.removeGeneralListeners();
        this.removeMouseMoveListener();
    }
}

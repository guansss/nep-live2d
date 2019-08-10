import { Tagged } from '@/core/utils/log';
import { Cancelable, debounce, throttle } from 'lodash';

export default class MouseHandler implements Tagged {
    tag = MouseHandler.name;

    /** Only focus when mouse is pressed */
    private focusOnPress = false;

    readonly element: HTMLElement;

    private readonly mouseMoveHandler = (e: MouseEvent) => this.mouseMove(e);

    /** How long will the focus last. Setting 0 or negative will behave the same as `Infinity` */
    private lostFocusTimeout: DOMHighResTimeStamp = Infinity;

    pressed = false;
    dragging = false;

    constructor(element: HTMLElement) {
        this.element = element;
        element.addEventListener('mousedown', e => this.mouseDown(e), { passive: true });
        element.addEventListener('mouseup', e => this.mouseUp(e), { passive: true });
        element.addEventListener('mouseout', e => this.mouseOut(e), { passive: true });

        // maybe adding these will make it support mobile browsers?
        // (will also require handling 'touchmove' and ignoring `button` property for touch events)
        //
        // element.addEventListener('touchstart', e => this.mouseDown(e), { passive: true });
        // element.addEventListener('touchend', e => this.mouseUp(e), { passive: true });

        if (!this.focusOnPress) {
            this.addMouseMoveListener();
        }
    }

    addMouseMoveListener() {
        this.element.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    }

    removeMouseMoveListener() {
        this.element.removeEventListener('mousemove', this.mouseMoveHandler);
    }

    mouseDown(e: MouseEvent) {
        // only handle left mouse button
        if (e.button !== 0) return;

        this.focus(e.clientX, e.clientY);

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
        this.focus(e.clientX, e.clientY);

        if (!this.pressed && !this.focusOnPress) {
            this.lostFocus();
        }
    }, 100);

    mouseUp(e: MouseEvent) {
        // only handle left mouse button
        if (e.button !== 0) return;

        if (this.pressed) {
            this.pressed = false;

            if (this.focusOnPress) {
                this.removeMouseMoveListener();
                this.clearFocus();
            }

            // detect single click event
            if (!this.dragging) {
                this.press(e.clientX, e.clientY);
            }
        }
    }

    /**
     * Will be triggered when cursor leaves the element
     */
    mouseOut(e: MouseEvent) {
        if (!this.focusOnPress) {
            this.clearFocus();
            this.mouseUp(e);
        }
    }

    focus(x: number, y: number) {}

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
}

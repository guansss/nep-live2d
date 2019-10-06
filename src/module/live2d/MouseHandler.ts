import autobind from 'autobind-decorator';
import debounce from 'lodash/debounce';
import Cancelable = _.Cancelable;

const DEAD_ZONE = 2;

export default class MouseHandler {
    readonly element: HTMLElement;

    /** Only focus when mouse is pressed */
    private focusOnPress = false;

    /** How long will the focus last. Setting 0 or negative value is equivalent to `Infinity` */
    private loseFocusTimeout: DOMHighResTimeStamp = Infinity;

    private pressed = false;
    private dragging = false;

    focusing = !this.focusOnPress;

    draggable = false;
    lastX = 0;
    lastY = 0;

    constructor(element: HTMLElement) {
        this.element = element;

        this.addGeneralListeners();

        if (!this.focusOnPress) {
            this.addMouseMoveListener();
        }

        this.updateLoseFocus();
    }

    addGeneralListeners() {
        this.element.addEventListener('mousedown', this.mouseDown);
        this.element.addEventListener('mouseup', this.mouseUp);
        this.element.addEventListener('mouseleave', this.mouseLeave);
    }

    removeGeneralListeners() {
        this.element.removeEventListener('mousedown', this.mouseDown);
        this.element.removeEventListener('mouseup', this.mouseUp);
        this.element.removeEventListener('mouseleave', this.mouseLeave);
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

        this.pressed = true;
        this.focusing = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;

        this.focus(e.clientX, e.clientY);

        this.addMouseMoveListener();

        if (!this.focusOnPress) {
            this.cancelLoseFocus();
        }
    }

    @autobind
    mouseMove(e: MouseEvent) {
        const movedX = e.clientX - this.lastX;
        const movedY = e.clientY - this.lastY;

        this.focusing = true;
        this.focus(e.clientX, e.clientY);

        if (this.pressed) {
            if (
                this.dragging ||
                movedX > DEAD_ZONE ||
                movedX < -DEAD_ZONE ||
                movedY > DEAD_ZONE ||
                movedY < -DEAD_ZONE
            ) {
                if (this.draggable) {
                    if (!this.dragging) {
                        this.dragStart(this.lastX, this.lastY);
                    } else {
                        this.dragMove(e.clientX, e.clientY, movedX, movedY);
                    }

                    this.lastX = e.clientX;
                    this.lastY = e.clientY;
                }

                this.dragging = true;
            }
        } else if (!this.focusOnPress) {
            this.loseFocus();
        }
    }

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

            if (this.dragging) {
                this.dragging = false;
                this.dragEnd();
            } else {
                this.click(e.clientX, e.clientY);
            }
        }
    }

    /**
     * Will be triggered when cursor leaves the element
     */
    @autobind
    mouseLeave(e: MouseEvent) {
        if (!this.focusOnPress) {
            this.clearFocus();
            this.mouseUp(e);
        } else if (this.dragging) {
            this.mouseUp(e);
        }
    }

    clearFocus() {
        this.focusing = false;
    }

    // must be initialized by calling `updateLoseFocus()` in constructor
    loseFocus!: (() => void) & Cancelable;

    private updateLoseFocus() {
        if (this.loseFocus) {
            this.cancelLoseFocus();
        }
        this.loseFocus = debounce(() => this.clearFocus(), this.loseFocusTimeout);
    }

    cancelLoseFocus() {
        this.loseFocus.cancel();
    }

    setFocusOnPress(enabled: boolean) {
        if (this.focusOnPress != enabled) {
            this.focusOnPress = enabled;

            if (enabled) {
                this.removeMouseMoveListener();
                this.cancelLoseFocus();
                this.clearFocus();
            } else {
                this.focusing = true;
                this.addMouseMoveListener();
            }
        }
    }

    setLoseFocusTimeout(value: DOMHighResTimeStamp) {
        this.loseFocusTimeout = value > 0 ? value : Infinity;
        if (value === Infinity) {
            this.cancelLoseFocus();
        } else {
            this.updateLoseFocus();
        }
    }

    destroy() {
        this.cancelLoseFocus();
        this.removeGeneralListeners();
        this.removeMouseMoveListener();
    }

    // to be overridden
    focus(x: number, y: number) {}

    click(x: number, y: number) {}

    dragStart(x: number, y: number) {}

    dragMove(x: number, y: number, dx: number, dy: number) {}

    dragEnd() {}
}

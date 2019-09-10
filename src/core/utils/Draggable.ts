import autobind from 'autobind-decorator';

declare global {
    interface MouseEvent {
        _movementX: number;
        _movementY: number;
    }
}

/**
 * Dragging experience in Wallpaper Engine is pretty awful, so we always need to mimic the dragging behaviour for elements by ourselves.
 */
export default class Draggable {
    dragged = false;

    lastMouseX = 0;
    lastMouseY = 0;

    /**
     *
     * @param element - Element that should be listen for drag event.
     * @param target - Element that should respond to the dragging with movement, if unset, only the listeners will be called.
     * @param deadZone - Maximum dragging distance to keep element static.
     * @param exact - Only trigger dragging if events are dispatched exactly from this element.
     */
    constructor(public element: HTMLElement, public target?: HTMLElement, public deadZone = 0, public exact = true) {
        element.addEventListener('mousedown', this.mousedown);
    }

    @autobind
    private mousedown(e: MouseEvent) {
        if ((!this.exact || e.target === e.currentTarget) && this.onStart(e)) {
            this.lastMouseX = e.screenX;
            this.lastMouseY = e.screenY;

            document.addEventListener('mousemove', this.mousemove, { passive: true });
            document.addEventListener('mouseup', this.mouseup);
            document.addEventListener('mouseout', this.mouseout);
        }
    }

    @autobind
    private mousemove(e: MouseEvent) {
        // `e.movementX` and `e.movementY` are always 0 in Wallpaper Engine,
        // need to calculate them manually.
        e._movementX = e.screenX - this.lastMouseX;
        e._movementY = e.screenY - this.lastMouseY;

        if (
            this.dragged ||
            e._movementX > this.deadZone ||
            e._movementX < -this.deadZone ||
            e._movementY > this.deadZone ||
            e._movementY < -this.deadZone
        ) {
            this.dragged = true;
            this.lastMouseX = e.screenX;
            this.lastMouseY = e.screenY;

            if (this.onDrag(e) && this.target) {
                this.target.style.left = this.target.offsetLeft + e._movementX + 'px';
                this.target.style.top = this.target.offsetTop + e._movementY + 'px';
            }
        }
    }

    @autobind
    private mouseup(e: MouseEvent) {
        this.onEnd(e);

        this.dragged = false;
        this.releaseGlobalListeners();
    }

    @autobind
    private mouseout(e: MouseEvent) {
        if (e.target === document.documentElement) {
            this.mouseup(e);
        }
    }

    private releaseGlobalListeners() {
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mouseup', this.mouseup);
        document.removeEventListener('mouseout', this.mouseout);
    }

    release() {
        this.element.removeEventListener('mousedown', this.mousedown);
        this.releaseGlobalListeners();
    }

    /**
     * @return True to start dragging, false to prevent dragging.
     */
    onStart = (e: MouseEvent) => true;

    /**
     * @return True to move the target element (if set), false to prevent moving.
     */
    onDrag = (e: MouseEvent) => true;

    onEnd = (e: MouseEvent) => {};
}

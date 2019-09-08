export type MouseEventHandler = (e: MouseEvent) => void;

declare global {
    interface MouseEvent {
        _movementX: number;
        _movementY: number;
    }
}

export interface Listeners {
    start?: MouseEventHandler;
    move?: MouseEventHandler;
    end?: MouseEventHandler;
}

interface MovableElement {
    element: HTMLElement;
    target?: HTMLElement;
    dragging: boolean;
    listeners: Listeners;
}

const movableElements: MovableElement[] = [];

let initialized = false;
let lastMouseX = 0;
let lastMouseY = 0;

/**
 * Dragging experience in Wallpaper Engine is pretty awful, so we always need to mimic the dragging behaviour for elements by ourselves.
 *
 * @param element - Element that should be listen for drag event.
 * @param target - Element that should respond to the movement.
 * @param listeners
 */
export function movable(element: HTMLElement, target?: HTMLElement, listeners: Listeners = {}) {
    const movableElement: MovableElement = {
        element,
        target,
        listeners,
        dragging: false,
    };
    movableElements.push(movableElement);

    if (!initialized) init();
}

function init() {
    initialized = true;

    document.addEventListener('mousedown', (e: MouseEvent) => {
        movableElements.forEach(movableElement => {
            if (e.target === movableElement.element) {
                movableElement.dragging = true;
                movableElement.listeners.start && movableElement.listeners.start(e);
            }
        });
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
        // `e.movementX` and `e.movementY` are somehow unavailable in Wallpaper Engine,
        // need to calculate them manually.
        e._movementX = e.screenX - lastMouseX;
        e._movementY = e.screenY - lastMouseY;
        lastMouseX = e.screenX;
        lastMouseY = e.screenY;

        movableElements.forEach(movableElement => {
            if (movableElement.dragging) {
                if (movableElement.target) {
                    movableElement.target.style.left = movableElement.target.offsetLeft + e._movementX + 'px';
                    movableElement.target.style.top = movableElement.target.offsetTop + e._movementY + 'px';
                }

                movableElement.listeners.move && movableElement.listeners.move(e);
            }
        });
    });

    document.addEventListener('mouseup', (e: MouseEvent) => {
        movableElements.forEach(movableElement => {
            movableElement.dragging = false;
            movableElement.listeners.end && movableElement.listeners.end(e);
        });
    });
}

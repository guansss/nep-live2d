/**
 * eventemitter3 patched with sticky events.
 *
 * @see http://greenrobot.org/eventbus/documentation/configuration/sticky-events/
 */

import EventEmitter from 'eventemitter3';

class PatchedEventEmitter extends EventEmitter {
    _stickies = new Events();
}

let prefix = '~';

function Events() {}

if (Object.create) {
    Events.prototype = Object.create(null);
    if (!new Events().__proto__) prefix = false;
}

function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}

function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
    }

    const evt = prefix ? prefix + event : event;

    // immediately call the listener when it matches a sticky event
    if (emitter._stickies[evt]) {
        fn.apply(context || emitter, emitter._stickies[evt]);

        // don't save this listener if it's once event
        if (once) return emitter;
    }

    const listener = new EE(fn, context || emitter, once);

    if (!emitter._events[evt]) (emitter._events[evt] = listener), emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    return emitter;
}

PatchedEventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
};

PatchedEventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
};

PatchedEventEmitter.prototype.addListener = PatchedEventEmitter.prototype.on;

PatchedEventEmitter.prototype.sticky = function sticky(event, a1, a2, a3, a4, a5) {
    const evt = prefix ? prefix + event : event;

    this._stickies[evt] = Array.prototype.slice.call(arguments, 1);

    // immediately emit this event to call existing listeners
    switch (arguments.length) {
        case 1:
            return this.emit(event);
        case 2:
            return this.emit(event, a1);
        case 3:
            return this.emit(event, a1, a2);
        case 4:
            return this.emit(event, a1, a2, a3);
        case 5:
            return this.emit(event, a1, a2, a3, a4);
        case 6:
            return this.emit(event, a1, a2, a3, a4, a5);
    }

    return this.emit(event, this._stickies[evt]);
};

export default PatchedEventEmitter;

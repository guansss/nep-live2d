/**
 * eventemitter3 patched with `newListener` event.
 *
 * @see https://nodejs.org/api/events.html#events_event_newlistener
 */

import EventEmitter from 'eventemitter3';

/* ================== Exactly the same with eventemitter3 ================== */

let has = Object.prototype.hasOwnProperty,
    prefix = '~';

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

/* ================== Exactly the same with eventemitter3 ================== */

function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
    }

    const listener = new EE(fn, context || emitter, once),
        evt = prefix ? prefix + event : event;

    if (!emitter._events[evt]) (emitter._events[evt] = listener), emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    // simply added this line
    emitter.emit('newListener', event, listener, context, once);

    return emitter;
}

EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
};

EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

export default EventEmitter;

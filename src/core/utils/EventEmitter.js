/**
 * eventemitter3 patched with `newListener` event.
 *
 * @see https://nodejs.org/api/events.html#events_event_newlistener
 */

import EventEmitter from 'eventemitter3';

const has = Object.prototype.hasOwnProperty,
    prefix = '~';

function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}

function addListener(emitter, event, fn, context, once) {
    if (event === 'newListener') return;

    if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
    }

    const listener = new EE(fn, context || emitter, once),
        evt = prefix ? prefix + event : event;

    emitter.emit('newListener', event, context, once);

    if (!emitter._events[evt]) (emitter._events[evt] = listener), emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    return emitter;
}

EventEmitter.prototype.on = EventEmitter.prototype.addListener = addListener;

export default EventEmitter;

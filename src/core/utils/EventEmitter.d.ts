import EventEmitter from 'eventemitter3';

export default EventEmitter;

export interface EventEntity {
    fn: (...args: any[]) => void;
    context: any;
    once: boolean;
}

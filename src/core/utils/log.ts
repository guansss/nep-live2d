import { inWallpaperEngine } from '@/core/utils/misc';
import { sayHello as pixiSayHello } from '@pixi/utils';

export interface LogRecord {
    tag: string;
    message: string;
    error: boolean;
    count: number;
}

const debug = !inWallpaperEngine;

export const logs = (() => {
    const arr: any = [];
    arr.limit = 200;
    return arr;
})() as LogRecord[] & { limit: number };

let lastLog: LogRecord;

const consoleLog = console.log;
const consoleError = console.error;

// say hello before messing up the native console!
pixiSayHello('WebGL');

// this can be useful to catch third-party logs
console.log = (...args: any[]) => log('Log', ...args);
console.warn = (...args: any[]) => error('Warn', ...args);
console.error = (...args: any[]) => error('Error', ...args);

window.onerror = (message, source, lineno, colno, err) =>
    error(
        'Uncaught',
        `${err && err.toString()}
Msg: ${message}
Src: ${source}
Ln: ${lineno}
Col ${colno}`,
    );

window.onunhandledrejection = (event: PromiseRejectionEvent) => error('Rejection', event.reason);

logs.push = (log: LogRecord) => {
    // when this log is identical to last log, we increase the counter rather than push it to the array
    if (lastLog && lastLog.tag === log.tag && lastLog.message === log.message) {
        lastLog.count++;
        return logs.length;
    }

    lastLog = log;

    if (logs.length === logs.limit) {
        logs.shift();
    }

    return Array.prototype.push.call(logs, log);
};

export function log(tag: string, ...messages: any[]) {
    logs.push({
        tag,
        message: messages.map(m => m && m.toString()).join(' '),
        error: false,
        count: 1,
    });

    if (debug) consoleLog(`[${tag.replace('\n', '')}]`, ...messages);
}

export function error(tag: string, ...messages: any[]) {
    logs.push({
        tag,
        message: messages.map(m => m && m.toString()).join(' '),
        error: true,
        count: 1,
    });

    if (debug) consoleError(`[${tag.replace('\n', '')}]`, ...messages);
}

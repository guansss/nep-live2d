interface LogRecord {
    tag?: string;
    message: string;
    error: boolean;
}

export interface Tagged {
    tag: string;
}

const logs: LogRecord[] = [];

export function log(sender?: Tagged, ...messages: any[]) {
    logs.push({
        tag: sender && sender.tag,
        message: messages.map(m => m && m.toString()).join(' '),
        error: false,
    });

    // eval('if(logs.length > 100) window.mka && window.mka.pause()');

    console.log(`[${sender ? sender.tag : ''}]`, ...messages);
}

export function error(sender?: Tagged, ...messages: any[]) {
    logs.push({
        tag: sender && sender.tag,
        message: messages.map(m => m && m.toString()).join(' '),
        error: true,
    });

    // eval('if(logs.length > 100) window.mka && window.mka.pause()');

    console.error(`[${sender ? sender.tag : ''}]`, ...messages);
}

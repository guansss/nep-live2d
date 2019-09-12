interface LogRecord {
    tag?: string;
    message: string;
    error: boolean;
}

const logs: LogRecord[] = [];

export function log(tag: string, ...messages: any[]) {
    logs.push({
        tag,
        message: messages.map(m => m && m.toString()).join(' '),
        error: false,
    });

    console.log(`[${tag}]`, ...messages);
}

export function error(tag: string, ...messages: any[]) {
    logs.push({
        tag,
        message: messages.map(m => m && m.toString()).join(' '),
        error: true,
    });

    console.error(`[${tag}]`, ...messages);
}

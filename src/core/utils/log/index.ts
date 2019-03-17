interface LogRecord {
    tag: string;
    message: string;
    error?: boolean;
}

interface Logger {
    (...messages: any[]): void;

    error(...messages: any[]): void;
}

export default function logger(tag: string): Logger {
    const log = function(...messages: any[]) {
        logger.logs.push({
            tag: tag,
            message: messages.map(m => m.toString()).join(' '),
        });

        console.log(`[${tag}]`, ...messages);
    } as Logger;

    log.error = function(...messages: any[]) {
        logger.logs.push({
            tag: tag,
            message: messages.map(m => m.toString()).join(' '),
            error: true,
        });

        console.error(`[${tag}]`, ...messages);
    };

    return log;
}

logger.logs = [] as LogRecord[];

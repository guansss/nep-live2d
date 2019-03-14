const logs = [];

function log(tag: string, ...messages: string[]) {
    logs.push({ tag, messages });

    console.log(`[${tag}]`, ...messages);
}

function error(tag: string, ...messages: string[]) {
    logs.push({ tag, messages, error: true });

    console.error(`[${tag}]`, ...messages);
}

/**
 * Creates a logger with specified tag.
 * @param tag
 */
function logger(tag: string) {
    const _log = (...message: string[]) => log(tag, ...message);
    _log.error = (...message: string[]) => error(tag, ...message);

    return _log;
}

export { log, logger };

const logs = [];

function log(tag, ...messages) {
    logs.push({ tag, messages });

    console.log(`[${tag}]`, ...messages);
}

function error(tag, ...messages) {
    logs.push({ tag, messages, error: true });

    console.error(`[${tag}]`, ...messages);
}

function logger(tag) {
    const _log = (...message) => log(tag, ...message);
    _log.error = (...message) => error(tag, ...message);

    return _log;
}

export { log, logger };

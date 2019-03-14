import { logger } from '../log';

enum ResultType {
    JSON,
    ArrayBuffer,
}

const log = logger('net');

async function getJSON(url: string) {
    const json = await ajax(url, { type: ResultType.JSON });

    log('Loaded JSON', url, json);

    return json;
}

async function getArrayBuffer(url: string) {
    const arrayBuffer = await ajax(url, { type: ResultType.ArrayBuffer });

    log(`Loaded ArrayBuffer(${arrayBuffer.length})`, url);

    return arrayBuffer;
}

async function ajax(url: string, { type }: { type?: ResultType } = {}) {
    const res = await fetch(url);

    // status 0 for loading a local file
    if (!(res.status === 0 || res.status === 200)) {
        log.error('Failed to load', url, `(${res.status})`);
    }

    let result;

    switch (type) {
        case ResultType.JSON: {
            const resultText = await res.text();

            try {
                result = JSON.parse(resultText);
            } catch (e) {
                //noinspection ExceptionCaughtLocallyJS
                throw 'Failed to parse JSON: ' + resultText;
            }
            break;
        }

        case ResultType.ArrayBuffer: {
            result = await res.arrayBuffer();
            break;
        }

        // defaults to ignoring the result
    }

    return result;
}

export { getJSON, getArrayBuffer };

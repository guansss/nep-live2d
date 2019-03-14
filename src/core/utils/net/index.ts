import { logger } from '../log';

const TYPE_JSON = Symbol();
const TYPE_ARRAY_BUFFER = Symbol();

const log = logger('net');

async function getJSON(url: string) {
    const json = await ajax(url, { type: TYPE_JSON });

    log('Loaded JSON', url, json);

    return json;
}

async function getArrayBuffer(url: string) {
    const arrayBuffer = await ajax(url, { type: TYPE_ARRAY_BUFFER });

    log(`Loaded ArrayBuffer(${arrayBuffer.length})`, url);

    return arrayBuffer;
}

async function ajax(url: string, { type }: { type?: symbol } = {}) {
    const res = await fetch(url);

    // status 0 for loading a local file
    if (!(res.status === 0 || res.status === 200)) {
        log.error('Failed to load', url, `(${res.status})`);
    }

    let result;

    switch (type) {
        case TYPE_JSON: {
            const resultText = await res.text();

            try {
                result = JSON.parse(resultText);
            } catch (e) {
                //noinspection ExceptionCaughtLocallyJS
                throw 'Failed to parse JSON: ' + resultText;
            }
            break;
        }

        case TYPE_ARRAY_BUFFER: {
            result = await res.arrayBuffer();
            break;
        }

        // defaults to ignoring the result
    }

    return result;
}

export { getJSON, getArrayBuffer };

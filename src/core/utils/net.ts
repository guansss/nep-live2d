import { error, log } from './log';

const enum ResultType {
    JSON,
    ArrayBuffer,
}

const TAG = 'Net';

async function getJSON(url: string) {
    const json = await ajax(url, { type: ResultType.JSON });

    log(TAG, 'Loaded JSON', url, json);

    return json;
}

async function getArrayBuffer(url: string) {
    const arrayBuffer: ArrayBuffer = await ajax(url, { type: ResultType.ArrayBuffer });

    log(TAG, `Loaded ArrayBuffer(${arrayBuffer.byteLength})`, url);

    return arrayBuffer;
}

async function ajax(url: string, { type }: { type?: ResultType } = {}) {
    const res = await fetch(url);

    // status 0 for loading a local file
    if (!(res.status === 0 || res.status === 200)) {
        error(TAG, 'Failed to load', url, `(${res.status})`);
    }

    let result;

    switch (type) {
        case ResultType.JSON: {
            const resultText = await res.text();

            try {
                result = JSON.parse(resultText);
            } catch (e) {
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

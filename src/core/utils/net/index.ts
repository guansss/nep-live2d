import { error, log, Tagged } from '../log';

const enum ResultType {
    JSON,
    ArrayBuffer,
}

const sender = { tag: 'Net' } as Tagged;

async function getJSON(url: string) {
    const json = await ajax(url, { type: ResultType.JSON });

    log(sender, 'Loaded JSON', url, json);

    return json;
}

async function getArrayBuffer(url: string) {
    const arrayBuffer: ArrayBuffer = await ajax(url, { type: ResultType.ArrayBuffer });

    log(sender, `Loaded ArrayBuffer(${arrayBuffer.byteLength})`, url);

    return arrayBuffer;
}

async function ajax(url: string, { type }: { type?: ResultType } = {}) {
    const res = await fetch(url);

    // status 0 for loading a local file
    if (!(res.status === 0 || res.status === 200)) {
        error(sender, 'Failed to load', url, `(${res.status})`);
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

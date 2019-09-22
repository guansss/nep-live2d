import { error, log } from './log';

const enum ResultType {
    None,
    JSON,
    ArrayBuffer,
}

const REQUEST_OPTIONS = {
    method: 'GET',
    body: {},
    type: ResultType.None,
};

const TAG = 'Net';

export async function getJSON(url: string) {
    const result = await request(url, { type: ResultType.JSON });

    log(TAG, 'Loaded JSON', url, result);

    return result;
}

export async function postJSON(url: string, json: any) {
    log(TAG, 'Post JSON', url, json);

    const result = await request(url, {
        method: 'POST',
        body: json,
        type: ResultType.JSON,
    });

    log(TAG, 'Result', url, result);

    return result;
}

export async function getArrayBuffer(url: string) {
    const arrayBuffer: ArrayBuffer = await request(url, { type: ResultType.ArrayBuffer });

    log(TAG, `Loaded ArrayBuffer(${arrayBuffer.byteLength})`, url);

    return arrayBuffer;
}

async function request(url: string, options: Partial<typeof REQUEST_OPTIONS> = {}) {
    const _options = Object.assign({}, REQUEST_OPTIONS, options) as typeof REQUEST_OPTIONS;

    const res = await fetch(
        url,
        _options.method === 'GET'
            ? undefined
            : {
                method: _options.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(_options.body),
            },
    );

    // status 0 for loading a local file
    if (!(res.status === 0 || res.status === 200)) {
        error(TAG, 'Failed to load', url, `(${res.status})`);
    }

    let result;

    switch (options.type) {
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

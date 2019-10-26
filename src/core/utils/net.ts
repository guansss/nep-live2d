import { error, log } from './log';

interface RequestOptions {
    method?: 'GET' | 'POST';
    body?: any;
    responseType?: XMLHttpRequestResponseType;
}

const TAG = 'Net';

export async function getJSON(url: string) {
    const result = await request(url, { responseType: 'json' });

    log(TAG, 'Loaded JSON', url, result);

    return result;
}

export async function postJSON(url: string, json: any) {
    log(TAG, 'Post JSON', url, json);

    const result = await request(url, {
        method: 'POST',
        body: json,
        responseType: 'json',
    });

    log(TAG, 'Result', url, result);

    return result;
}

export async function getArrayBuffer(url: string) {
    const arrayBuffer = await request<ArrayBuffer>(url, { responseType: 'arraybuffer' });

    log(TAG, `Loaded ArrayBuffer(${arrayBuffer.byteLength})`, url);

    return arrayBuffer;
}

async function request<T extends any>(url: string, options: RequestOptions = {}): Promise<T> {
    // DON'T use fetch because it refuses load local files
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url);

    xhr.responseType = options.responseType || '';
    xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

    const res = await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new TypeError('Request failed'));

        xhr.send(options.body && JSON.stringify(options.body));
    });

    // status 0 for loading a local file
    if (!(xhr.status === 0 || xhr.status === 200)) {
        error(TAG, 'Failed to load', url, `(${xhr.status})`);
    }

    return res as T;
}

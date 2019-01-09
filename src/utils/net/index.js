import {logger} from '@/utils/log';

const log = logger('net');

async function loadJSON(url) {
    try {
        const res = await fetch(url);

        // status 0 for loading a local file
        if (!(res.status === 0 || res.status === 200)) {
            log.error('Failed to load JSON:', url, `(${res.status})`);
        }

        const result = await res.json();

        log('Loaded JSON:', url, '\n', result);

        return result;
    } catch (e) {
        log(e);
    }
}

export {
    loadJSON
};

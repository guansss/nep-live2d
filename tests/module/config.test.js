import 'jest-canvas-mock';
import 'jest-localstorage-mock';
import { createApp } from '../tools';
import ConfigModule from '../../src/module/config';

// noinspection JSUndefinedPropertyAssignment
global.localStorage = localStorage;

const appPromise = (async () => {
    const app = await createApp();
    app.use(ConfigModule);
})();

it('should emit events', async function() {
    const app = await appPromise;

    localStorage.clear();

    const listener = jest.fn();
    app.on('configUpdate', listener);

    app.emit('config', 'test.string', '123');
    expect(listener).toBeCalledWith('test.string', undefined, '123', expect.objectContaining({ test: { string: '123' } })); // eslint-disable-line prettier/prettier

    app.emit('config', 'test.string', '234');
    expect(listener).toBeCalledWith('test.string', '123', '234', expect.objectContaining({ test: { string: '234' } }));

    app.emit('config', 'test.number', 123);
    expect(listener).toBeCalledWith('test.number', undefined, 123, expect.any(Object));

    app.emit('config', 'test.boolean', true);
    expect(listener).toBeCalledWith('test.boolean', undefined, true, expect.any(Object));

    const object = { a: 1 };
    app.emit('config', 'test.object', object);
    expect(listener).toBeCalledWith('test.object', undefined, object, expect.objectContaining({ test: { object } }));

    const array = ['123', 123, true];
    app.emit('config', 'test.for.array', array);
    expect(listener).toBeCalledWith('test.for.array', undefined, array, expect.objectContaining({ test: { for: { array } } })); // eslint-disable-line prettier/prettier
});

it('should save to localStorage', async function() {
    const app = await appPromise;

    localStorage.clear();

    app.emit('config', 'test', 1);
    expect(localStorage.getItem('test')).toBe(1);
});

it('should handle `configInit` event properly', async function() {
    const app = await createApp();

    localStorage.clear();

    const listener = jest.fn();
    app.on('configInit', listener);

    app.use(ConfigModule);
    expect(listener).toBeCalledWith(expect.any(Object));

    app.emit('config', 'test', 1);
    expect(listener).toBeCalledWith(expect.objectContaining({ test: 1 }));
});

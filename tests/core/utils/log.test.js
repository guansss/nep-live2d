import logger from '@/core/utils/log';

console.log = jest.fn();
console.error = jest.fn();

it('should log messages', () => {
    const log = logger('test');

    log(1, '2', [3], { a: 4 });
    expect(console.log).toBeCalledWith('[test]', 1, '2', [3], { a: 4 });

    log.error(1, '2', [3], { a: 4 });
    expect(console.error).toBeCalledWith('[test]', 1, '2', [3], { a: 4 });
});

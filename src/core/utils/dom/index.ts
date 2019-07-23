function promisify(image: HTMLImageElement) {
    return new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });
}
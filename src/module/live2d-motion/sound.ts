export namespace SoundManager {
    export let volume = 0.1;

    export async function playSound(file: string) {
        const audio = document.createElement('audio');
        audio.volume = volume;
        audio.src = file;

        await new Promise(resolve => {
            audio.addEventListener('ended', resolve);
            audio.play();
        });
    }
}

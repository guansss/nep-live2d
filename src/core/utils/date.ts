const date = new Date();
const year = date.getFullYear();

export function isInRange(from: string, to: string) {
    return (
        date.getTime() >= new Date(`${year}-${from}`).getTime() && date.getTime() <= new Date(`${year}-${to}`).getTime()
    );
}

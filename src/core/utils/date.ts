type DateRange = [string, string];

const date = new Date('11-1');
const year = date.getFullYear();

function isInRange(range: DateRange) {
    return (
        date.getTime() > new Date(`${year}-${range[0]}`).getTime() &&
        date.getTime() < new Date(`${year}-${range[1]}`).getTime()
    );
}

export const HALLOWEEN = isInRange(['10-25', '11-5']);
export const CHRISTMAS = isInRange(['12-20', '12-31']);
export const NEW_YEAR = isInRange(['1-1', '1-10']);

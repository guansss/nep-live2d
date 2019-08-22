export function clamp(num: number, lower: number, upper: number) {
    return num < lower ? lower : num > upper ? upper : num;
}

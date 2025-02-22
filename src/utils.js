// utils.js
export function round2digtNum(n) {
    const num = Number(n);
    return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}
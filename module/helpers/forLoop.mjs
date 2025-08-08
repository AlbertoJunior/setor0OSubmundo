export default function forLoop(start, end, options) {
    let ret = '';
    for (let i = start; i < end; i++) {
        ret += options.fn({ index: i, indexPlus: i + 1, indexMinus: i - 1 });
    }
    return ret;
}
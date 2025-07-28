export default function forLoop(start, end, options) {
    let ret = '';
    for (let i = start; i < end; i++) {
        ret += options.fn({ index: i });
    }
    return ret;
}
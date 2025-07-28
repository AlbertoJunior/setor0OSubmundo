export default function concat(...args) {
    args.pop();
    return args.join('');
}
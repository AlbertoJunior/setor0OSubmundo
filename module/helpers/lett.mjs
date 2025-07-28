export default function lett(params) {
    return params.fn(Object.assign({}, this, params.hash));
}
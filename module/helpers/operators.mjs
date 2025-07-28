const operators = {
    eq: (values) => values.every(v => v === values[0]),
    not: ([value]) => !value,
    lt: ([a, b]) => a < b,
    lte: ([a, b]) => a <= b,
    gt: ([a, b]) => a > b,
    gte: ([a, b]) => a >= b,
    isNull: ([value]) => value === null || value === undefined,
    isNotNull: ([value]) => !operators['isNull']([value]),
    isEmpty: (collection) => Array.isArray(collection) && collection.length === 0,
    isNotEmpty: (collection) => Array.isArray(collection) && collection.length > 0,
    or: (values) => values.some(Boolean),
    orValue: (values) => {
        const a = values[0];
        const b = values[1];
        return a !== undefined && a !== null ? a : b;
    },
    ternary: (values) => {
        return values[0] ? values[1] : values[2];
    },
};

export default function operator(op, ...params) {
    params.pop();
    const input = params.length === 1 && Array.isArray(params[0])
        ? params[0]
        : params;

    return operators[op](input);
}

export function unique(prefix) {
    let count = -1;
    return f => {
        return `${prefix}_${++count}`;
    };
}

export function noop() {
}


function parse(input) {
    const trimmedInput = input.trim();

    if(!trimmedInput) {
        return undefined;
    }

    const parts = trimmedInput.split(/\s+/);

    return {
        command: parts[0].toUpperCase(),
        args: parts.slice(1),
    };
}

module.exports = parse;
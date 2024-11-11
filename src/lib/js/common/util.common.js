export function waitFor(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

export function randomID() {
    return getRandomNumberForID() + getRandomNumberForID() + '-' + getRandomNumberForID() + '-' + getRandomNumberForID() + '-' + getRandomNumberForID() + '-' + getRandomNumberForID() + getRandomNumberForID() + getRandomNumberForID()
}

function getRandomNumberForID() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

export function capitalizeWords(string, separator) {
    if (!string)
        return

    return string
        .split(separator ?? " ")
        .map((word) => capitalizeFirstLetter(word))
        .join(separator ?? " ")
}

function capitalizeFirstLetter(string) {
    if (!string)
        return

    string = string.trim()

    return (string[0] === 'i' ? 'İ' : string[0].toUpperCase()) + string.slice(1).toLowerCase()
}

export function capitalizeFirstLetterOnly(string) {
    if (!string)
        return

    string = string.trim()

    return (string[0] === 'i' ? 'İ' : string[0].toUpperCase()) + string.slice(1)
}
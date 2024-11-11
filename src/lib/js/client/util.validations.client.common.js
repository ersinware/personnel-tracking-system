import {browser} from "$app/environment";

export function onValidityChange(arrFormValid) {
    if (!browser)
        return false

    return allTrue(arrFormValid)
}

function allTrue(arr) {
    return !arr.includes(false) && !arr.includes(undefined)
}

function formatMaxLength(value, maxLength) {
    if (value.length > maxLength)
        return {preventDefault: true}
}

export function validateEmailAddress(value) {
    return /^\w+([\._-]?\w+)*@\w+([\._-]?\w+)*(\.\w{2,3})+$/.test(value)
}

export function validatePassword(value) {
    if (!value)
        return false

    return value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/) ?? false
}

export function validateUnitName(value) {
    return value.length >= 2 && value.length <= 45
}

export function formatUnitName(value) {
    return formatMaxLength(value, 45)
}

export function validateDate(value) {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value))
        return false

    const [day, month, year] = value.split('.').map(Number)

    return !(day < 1 || day > 31 || month < 1 || month > 12 || year < 1000 || year > 9999);
}

export function validateUserFullName(value) {
    return value.length >= 2 && value.length <= 60
}

export function formatUserFullName(value) {
    return formatMaxLength(value, 60)
}

export function validateSecondPassword(firstPassword, secondPassword) {
    if (!firstPassword)
        return false

    return firstPassword === secondPassword
}

export function validateWorkContent(value) {
    return value.length >= 10
}
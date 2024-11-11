import {browser} from "$app/environment"
import {anyOpenModal, closeLastModal} from "$lib/js/client/util.modals.client.common.js"
import {get} from "svelte/store"

if (browser)
    addEscapeAndEnterListener()

const formsBeingTracked = new Map()

let dontInterruptModal,
    escapeInterceptors = []

export function init(_dontInterruptModal) {
    dontInterruptModal = _dontInterruptModal
}

export function registerEscapeInterceptor(id, f) {
    escapeInterceptors.push({id, f})
}

export function unregisterEscapeInterceptor(id) {
    escapeInterceptors = escapeInterceptors.filter((element) => element.id !== id)
}

export function addEscapeAndEnterListener() {
    if (document.onkeydown)
        return

    document.onkeydown = (event) => {
        if (event.key === "Escape" || event.keyCode === 27) {
            if (escapeInterceptors.length > 0) {
                escapeInterceptors[escapeInterceptors.length - 1].f()

                return
            }

            if (!get(dontInterruptModal) && anyOpenModal())
                closeLastModal()

            return
        }

        if (event.key === "Tab" || event.keyCode === 9) {
            event.preventDefault()
            focusNext()

            return
        }

        if ((event.key === "Enter" || event.keyCode === 13) && document.activeElement.contentEditable !== 'true')
            event.preventDefault()
    }
}

export function focusNext() {
    const inputs = Array.prototype.slice.call(document.querySelectorAll("[contenteditable], input:not(:disabled, [type=file]), textarea:not(:disabled)"))

    if (!inputs || !inputs?.length)
        return

    let nextIndex = inputs.indexOf(document.activeElement) + 1
    if (nextIndex > inputs.length - 1)
        nextIndex = 0

    const next = inputs[nextIndex]

    next.scrollIntoView({block: 'center', behavior: 'instant'})
    next.focus()
}

export function trackFormForDifference(form, dataAtFirst, callback) {
    const _dataAtFirst = structuredClone(dataAtFirst)

    for (const property in _dataAtFirst) {
        _dataAtFirst[property] = _dataAtFirst[property]?.toString()
    }

    formsBeingTracked.set(form.id, {form, dataAtFirst: _dataAtFirst, callback})
    onInput({form, dataAtFirst: _dataAtFirst, callback})

    form.addEventListener("input", onInput)
}

export function removeTrackingFormDifference(form) {
    if (!formsBeingTracked.has(form.id))
        return

    form.removeEventListener('input', onInput)

    formsBeingTracked.delete(form.id)
}

async function onInput(event) {
    const {form, callback, dataAtFirst} = (() => {
        if (event.detail)
            return formsBeingTracked.get(event.detail.formId)

        if (event.currentTarget)
            return formsBeingTracked.get(event.currentTarget.id)

        return event
    })()

    for (const node of form.querySelectorAll("input, textarea, [contenteditable]")) {
        if (node.type === 'file')
            continue

        if (!areEqualStrings(dataAtFirst[node.id], node.value ?? await node.getContent())) {
            callback(false)

            return
        }
    }

    callback(true)
}

export function areEqualStrings(valueOne, valueTwo) {
    if (!valueOne && !valueTwo)
        return true

    if (!valueOne || !valueTwo)
        return false

    return valueOne
        .toString()
        .trim()
        .toLowerCase()
        .localeCompare(valueTwo.toString().trim().toLowerCase(), undefined, {sensitivity: 'accent'}) === 0
}

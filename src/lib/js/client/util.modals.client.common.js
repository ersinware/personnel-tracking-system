import {closeLamp, openLamp} from "$lib/js/client/util.lamp.client.common.js"
import {get} from "svelte/store"
import {DURATION_TRANSITION_MODAL} from './constants.transitions.client.common.js'
import {randomID, waitFor} from "$lib/js/common/util.common.js";

let openModals, openDynamicModals, holder, dontInterruptModal

export function init(_openModals, _openDynamicModals, _holder, _dontInterruptModal) {
    openModals = _openModals
    openDynamicModals = _openDynamicModals
    dontInterruptModal = _dontInterruptModal
    holder = _holder
}

export function openModal(modal) {
    const temp = get(openModals)

    openDynamicModal(modal)

    temp.unshift(modal)
    openModals.set(temp)

    if (temp.length === 1)
        closeLamp()
    else
        closeCurrentModal()
}

export function closeLastModal() {
    const temp = get(openModals)
    temp.shift()

    closeLastDynamicModal(true)

    openModals.set(temp)

    if (temp.length === 0) {
        openLamp()
        setTimeout(() => {
            dontInterruptModal.set(false)
            holder.set({})
        }, DURATION_TRANSITION_MODAL)
    } else
        openPreviousModal()
}

export function anyOpenModal() {
    return get(openModals).length > 0
}

function closeCurrentModal() {
    const temp = get(openModals),
        modal = temp[1]

    if (!modal.addToBackstack)
        openModals.set(temp.filter((_entry) => _entry !== modal))

    closeLastDynamicModal()
}

function openPreviousModal() {
    openDynamicModal(get(openModals)[0])
}

function openDynamicModal(modal) {
    if (!modal.id) modal.id = randomID()

    const temp = get(openDynamicModals)
    temp.unshift(modal)
    openDynamicModals.set(temp)
}

function closeLastDynamicModal(fromStart) {
    const temp = get(openDynamicModals)

    if (fromStart) temp.shift()
    else temp.pop()

    openDynamicModals.set(temp)
    dontInterruptModal.set(false)
}

export async function closeAllModals() {
    openModals.set([])
    openDynamicModals.set([])

    openLamp()
    await waitFor(DURATION_TRANSITION_MODAL * 2)
    holder.set({})
    dontInterruptModal.set(false)
}
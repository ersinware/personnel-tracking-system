import {performRippleEffectAndWait} from "$lib/js/client/util.client.common.js"
import {anyOpenModal, closeLastModal} from "$lib/js/client/util.modals.client.common.js"
import {get} from "svelte/store"
import {closeLeftMenu, isLeftMenuOpen} from "$lib/js/client/left.menu.small.screen.client.js";

let lastLampClickedAt = Date.now(),
    dontInterruptModal

export function init(_dontInterruptModal) {
    dontInterruptModal = _dontInterruptModal
}

export function openLamp() {
    document.getElementById("lamp").classList.remove("close-lamp")
    allowScroll()
}

export function closeLamp() {
    document.getElementById("lamp").classList.add("close-lamp")
    cancelScroll()
}

export function cancelScroll() {
    document.querySelectorAll("[data-scrollable]").forEach((node) => node.classList.add("o-y-hidden"))
}

export function allowScroll() {
    document.querySelectorAll("[data-scrollable]").forEach((node) => node.classList.remove("o-y-hidden"))
}

export async function onLampClick(event) {
    const now = Date.now()

    if (now - lastLampClickedAt < 750)
        return

    lastLampClickedAt = now

    if (!get(dontInterruptModal) && anyOpenModal()) {
        await performRippleEffectAndWait(event)

        closeLastModal()

        return
    }

    if (isLeftMenuOpen()) {
        await performRippleEffectAndWait(event)

        closeLeftMenu()
    }
}

import {closeLamp, openLamp} from "$lib/js/client/util.lamp.client.common.js";
import {get} from "svelte/store";

let _openLeftMenu

export function init(__openLeftMenu) {
    _openLeftMenu = __openLeftMenu
}

export function openLeftMenu() {
    closeLamp()
    _openLeftMenu.set(true)
}

export function closeLeftMenu(dontOpenLamp) {
    _openLeftMenu.set(false)

    if (!dontOpenLamp)
        openLamp()
}

export function isLeftMenuOpen() {
    return get(_openLeftMenu)
}
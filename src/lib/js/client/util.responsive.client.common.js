import {get} from "svelte/store"
import {closeLeftMenu, isLeftMenuOpen} from "$lib/js/client/left.menu.small.screen.client.js";

let onMountTouchableQueue = [],
    onMountTouchableReverseQueue = [],
    onMountHoverableQueue = [],
    onMountHoverableReverseQueue = [],
    onMountBigScreenQueue = [],
    onMountSmallScreenQueue = [],
    onMountBigScreenReverseQueue = [],
    onMountSmallScreenReverseQueue = [],
    touchable,
    hoverable,
    bigScreen

export async function init(_touchable, _hoverable, _bigScreen) {
    touchable = _touchable
    hoverable = _hoverable
    bigScreen = _bigScreen

    setupTouchable()
    setupHoverable()
    setupBigScreen()
}

function setupTouchable() {
    const mqlTouchable = window.matchMedia("((hover: none) and (pointer: fine)) or ((hover: none) and (pointer: coarse)) or ((hover: hover) and (pointer: coarse))")
    touchable.set(mqlTouchable.matches)
    addTouchableListener(mqlTouchable)
}

function addTouchableListener(mql) {
    mql.addEventListener("change", (query) => {
        touchable.set(query.matches)
    })
}

export function removeOnTouchable(id) {
    onMountTouchableQueue = onMountTouchableQueue.filter((item) => item.id !== id)
}

export function removeOnTouchableReverse(id) {
    onMountTouchableReverseQueue = onMountTouchableReverseQueue.filter((item) => item.id !== id)
}

export function removeOnTouchableListeners(id) {
    removeOnTouchable(id)
    removeOnTouchableReverse(id)
}

function setupHoverable() {
    const mqlHoverable = window.matchMedia("(hover: hover)")
    hoverable.set(mqlHoverable.matches)
    addHoverableListener(mqlHoverable)
}

function addHoverableListener(mql) {
    mql.addEventListener("change", (query) => {
        hoverable.set(query.matches)

        if (query.matches)
            onHoverable()
        else
            onHoverableReverse()
    })
}

function onHoverable() {
    for (const element of onMountHoverableQueue)
        element.onMount()
}

function onHoverableReverse() {
    for (const element of onMountHoverableReverseQueue)
        element.reverse()
}

export function onMountHoverable(param) {
    onMountHoverableQueue.push(param)
    if (get(hoverable))
        param.onMount()
}

export function onMountHoverableReverse(param) {
    onMountHoverableReverseQueue.push(param)
}

export function removeOnHoverable(id) {
    onMountHoverableQueue = onMountHoverableQueue.filter((item) => item.id !== id)
}

export function removeOnHoverableReverse(id) {
    onMountHoverableReverseQueue = onMountHoverableReverseQueue.filter((item) => item.id !== id)
}

function setupBigScreen() {
    const mqlBigScreen = window.matchMedia("(min-width: 65.001em)")
    bigScreen.set(mqlBigScreen.matches)
    addBigScreenListener(mqlBigScreen)
}

function addBigScreenListener(mql) {
    mql.addEventListener("change", (query) => {
        bigScreen.set(query.matches)

        if (isLeftMenuOpen())
            closeLeftMenu()

        if (query.matches)
            onBigScreen()
        else
            onSmallScreen()
    })
}

function onBigScreen() {
    for (const element of onMountSmallScreenReverseQueue)
        element.reverse()

    for (const element of onMountBigScreenQueue)
        element.onMount()
}

function onSmallScreen() {
    for (const element of onMountBigScreenReverseQueue)
        element.reverse()

    for (const element of onMountSmallScreenQueue)
        element.onMount()
}
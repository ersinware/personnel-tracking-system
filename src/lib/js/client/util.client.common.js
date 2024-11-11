import {browser} from '$app/environment'
import {goto} from '$app/navigation'
import {getContext, setContext} from 'svelte'
import {writable} from 'svelte/store'
import {DURATION_WAIT_FOR_RIPPLE_TYPE_ONE} from './constants.transitions.client.common.js'
import {waitFor} from "$lib/js/common/util.common.js";

let rippleTargetInfo,
    dontInterruptModal

export function init(_rippleTargetInfo, _dontInterruptModal) {
    rippleTargetInfo = _rippleTargetInfo
    dontInterruptModal = _dontInterruptModal

    initZeroTimeout()
}

function initZeroTimeout() {
    const timeouts = [],
        messageName = 'zero-timeout-message'

    function setZeroTimeout(f) {
        timeouts.push(f)
        window.postMessage(messageName, '*')
    }

    function handleMessage(event) {
        if (event.source !== window || event.data !== messageName) return

        event.stopPropagation()

        if (timeouts.length > 0) timeouts.shift()()
    }

    window.addEventListener('message', handleMessage, true)
    window.setZeroTimeout = setZeroTimeout
}

export function getStore(key) {
    return getContext(key)
}

export function createStore(key, defaultValue) {
    setContext(key, writable(defaultValue))

    return getContext(key)
}

export function performRippleEffect(
    event,
    rippleType = 1,
    rippleColor = 'var(--color-ripple)',
    borderRadius = 'var(--border-radius)'
) {
    const rect = event.currentTarget.getBoundingClientRect()

    rippleTargetInfo.set({
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
        clickX: event.clientX,
        clickY: event.clientY,
        rippleType,
        rippleColor,
        borderRadius
    })
}

export async function performRippleEffectAndWait(event) {
    performRippleEffect(event)
    await waitFor(DURATION_WAIT_FOR_RIPPLE_TYPE_ONE)
}

export function yieldToMain() {
    if (browser && setZeroTimeout)
        return new Promise(resolve => setZeroTimeout(() => queueMicrotask(resolve)))
    else
        return new Promise(resolve => setTimeout(() => queueMicrotask(resolve), 0))
}

export async function onLinkClick(event) {
    event.preventDefault()

    const href = event.currentTarget.href

    await performRippleEffectAndWait(event)
    goto(href)
}

export async function _fetch(url, options = {}, onSuccess, onError) {
    try {
        const response = await fetch(url, options),
            body = await response.json()

        if (response.status === 200) {
            onSuccess(body)

            return
        }

        onError(body)
    } catch (error) {
        onError({error})
    }
}

export async function sendMessageToWorker(data) {
    const registration = await navigator.serviceWorker.ready
    registration.active.postMessage(data)
}
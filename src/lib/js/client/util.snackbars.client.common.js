import {get} from 'svelte/store'
import {randomID, waitFor} from "$lib/js/common/util.common.js";

let openSnackbars, bigScreen

export function init(_openSnackbars, _bigScreen) {
    openSnackbars = _openSnackbars
    bigScreen = _bigScreen
}

async function showSnackbar(snackbar, delay) {
    const temp = get(openSnackbars)
    snackbar.id = randomID()

    if (!get(bigScreen))
        temp.push(snackbar)
    else
        temp.unshift(snackbar)

    openSnackbars.set(temp)

    await waitFor(delay ?? (temp.length > 0 ? 5000 + temp.length * 1000 : 5000))

    closeSnackbar(snackbar.id)
}

export function closeSnackbar(id) {
    openSnackbars.set(get(openSnackbars).filter(_snackbar => _snackbar.id !== id))
}

export function showErrorSnackbar(error, actions) {
    showSnackbar({
        content: error ?? 'Bir hata meydana geldi. Daha sonra tekrar deneyin.',
        backgroundColor: 'var(--color-error)',
        dividerColor: "rgb(255, 255, 255, .4)",
        actions
    })
}

export function showPositiveSnackbar(message, actions) {
    showSnackbar({
        content: message,
        backgroundColor: 'var(--color-positive)',
        dividerColor: "rgb(255, 255, 255, .4)",
        actions
    })
}
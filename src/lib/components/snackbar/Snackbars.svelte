<script>
    import { getStore } from '$lib/js/client/util.client.common'
    import { flip } from 'svelte/animate'
    import { cubicInOut } from 'svelte/easing'
    import Snackbar from './Snackbar.svelte'

    const openSnackbars = getStore('openSnackbars')
</script>

<div class="wrapper b-box p-f p-c-h flex f-column a-i-c g-1dot25 w-100 p-none p-h-d">
    {#each $openSnackbars as snackbar (snackbar)}
        <div animate:flip={{ easing: cubicInOut }}>
            <Snackbar
                --content-color={snackbar.contentColor ?? ''}
                --content-divider-color={snackbar.dividerColor ?? 'var(--color-divider)'}
                --snackbar-background-color={snackbar.backgroundColor ?? ''}
                --positive-button-color={snackbar.positiveButtonColor ?? ''}
                --negative-button-color={snackbar.negativeButtonColor ?? ''}
                id={snackbar.id}
                content={snackbar.content}
                actions={snackbar.actions}
            />
        </div>
    {/each}
</div>

<style>
    .wrapper {
        z-index: 999999;
        max-width: calc(100% - 2 * var(--main-h-padding));
    }

    @media (min-width: 65.001em) {
        .wrapper {
            bottom: calc(var(--p-v) * 1.5);
        }
    }

    @media (max-width: 65em) {
        .wrapper {
            top: var(--p-v);
        }
    }
</style>

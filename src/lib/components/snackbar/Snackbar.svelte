<script>
    import {getStore, performRippleEffectAndWait} from '$lib/js/client/util.client.common'
    import {closeSnackbar} from '$lib/js/client/util.snackbars.client.common'
    import {cubicInOut} from 'svelte/easing'
    import {fly} from 'svelte/transition'

    export let id, content, actions

    const bigScreen = getStore('bigScreen')

    async function onActionClick(event, action) {
        await performRippleEffectAndWait(event)

        closeSnackbar(id)
        action()
    }
</script>

<article
        class="wrapper flex a-i-c g-1dot5 b-r-d"
        in:fly={{ y: $bigScreen ? '.5rem' : '-.5rem', easing: cubicInOut }}
        out:fly={{ y: $bigScreen ? '.5rem' : '-.5rem', easing: cubicInOut }}
>
    <div class="content l-h-1 f-w-700 t-a-c">{content}</div>

    {#if actions}
        <article class="v-divider h-100"/>

        <section class="actions flex g-1dot25">
            {#each actions as {name, action, positive}}
                <button
                        class="button-nude button-small"
                        class:positive
                        on:click={(event) => onActionClick(event, action)}>
                    {name}
                </button>
            {/each}
        </section>
    {/if}
</article>

<style>
    .wrapper {
        padding: 0.5rem 1.25rem;

        background-color: var(--snackbar-background-color, var(--color-positive));
    }

    .content {
        font-family: Poppins, sans-serif;

        color: var(--content-color, white) !important;
        letter-spacing: .0125rem;

        font-size: .7rem;
    }

    .v-divider {
        height: 0.75rem;
        background-color: var(--content-divider-color);
    }

    .button-nude {
        pointer-events: painted !important;
        color: var(--negative-button-color, white) !important;
        letter-spacing: 0.1rem;
        margin-bottom: -0.1rem;
        font-size: .725rem;
    }

    .positive {
        color: var(--positive-button-color, white) !important;
    }

    @media (hover: hover) {
        .button-nude {
            color: var(--negative-button-color, white) !important;
        }

        .button-nude.positive {
            color: var(--positive-button-color, white) !important;
        }
    }
</style>

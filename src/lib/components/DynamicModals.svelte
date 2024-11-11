<script>
    import {
        DURATION_TRANSITION_MODAL,
        TRANSITION_MODAL_Y
    } from '$lib/js/client/constants.transitions.client.common'
    import { getStore } from '$lib/js/client/util.client.common'
    import { cubicInOut } from 'svelte/easing'
    import { fly } from 'svelte/transition'

    const openDynamicModals = getStore('openDynamicModals'),
        bigScreen = getStore('bigScreen')
</script>

{#each $openDynamicModals as modal (modal.id)}
    <div
        style={modal.modalWrapperStyle ?? ''}
        class="wrapper-modal p-f color-background o-hidden small-screen-w-100 small-screen-max-w-phone {modal.modalWrapperClasses ??''}"
        in:fly={modal.modalTransition ?? {
            y: $bigScreen ? '-' + TRANSITION_MODAL_Y : TRANSITION_MODAL_Y,
            duration: DURATION_TRANSITION_MODAL,
            easing: cubicInOut
        }}
        out:fly={modal.modalTransition ?? {
            y: $bigScreen ? '-' + TRANSITION_MODAL_Y : TRANSITION_MODAL_Y,
            duration: DURATION_TRANSITION_MODAL,
            easing: cubicInOut
        }}
        on:introstart={modal.onIntroStart}
        on:introend={modal.onIntroEnd}
        on:outrostart={modal.onOutroStart}
        on:outroend={modal.onOutroEnd}
    >
        <svelte:component this={modal.component} {...modal.props} />
    </div>
{/each}

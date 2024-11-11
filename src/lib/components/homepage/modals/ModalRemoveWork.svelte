<script>
    import Progress from "$lib/components/Progress.svelte";
    import {_fetch, getStore, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {closeLastModal} from "$lib/js/client/util.modals.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL,
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {EVENT_WORK_REMOVED} from "$lib/js/client/events.client.js";

    export let id

    const dontInterruptModal = getStore('dontInterruptModal');

    let state

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeLastModal()
    }

    async function onRemoveClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        _fetch(
            '/api/work/remove-work',
            {method: 'DELETE', body: id},
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                closeLastModal()
                await waitFor(DURATION_TRANSITION_MODAL)
                window.dispatchEvent(new CustomEvent(EVENT_WORK_REMOVED))
            },
            async (body) => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                $dontInterruptModal = false
                showErrorSnackbar(body.error)
            }
        )
    }
</script>

<article class="wrapper-modal-content flex f-column a-i-c g-v-d-modal big-screen-max-w-modal-content-small">
    <Progress bind:state forModal/>

    <h2 class="title-modal">Emin Misiniz?</h2>

    <p class="text-modal">
        Çalışma kalıcı olarak silenecek.

        <br>
        <br>

        <span class="color-text-error f-w-500">
            Bu işlem geri alınamaz. Çalışmayı gerçekten kalıcı olarak silmek istiyor musunuz?
        </span>
    </p>

    <div class="m-t-button flex j-c-c wrapper-modal-buttons">
        <button disabled={$dontInterruptModal}
                class="button-nude button-nude-positive"
                class:button-nude-disabled={$dontInterruptModal}
                on:click={onCancelClick}>
            VAZGEÇ
        </button>

        <button disabled={$dontInterruptModal}
                class:button-nude-disabled={$dontInterruptModal}
                class="button-nude button-nude-negative"
                on:click={onRemoveClick}>
            EVET, SİL
        </button>
    </div>
</article>

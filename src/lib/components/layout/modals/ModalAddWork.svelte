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
    import {EVENT_WORK_ADDED} from "$lib/js/client/events.client.js";
    import {onValidityChange, validateWorkContent} from "$lib/js/client/util.validations.client.common.js";
    import TextArea from "$lib/components/TextArea.svelte";

    const dontInterruptModal = getStore('dontInterruptModal'),
        arrFormValid = new Array(1)

    let state

    $: formValid = onValidityChange(arrFormValid)

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeLastModal()
    }

    async function onAddClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        _fetch(
            '/api/work/add-work',
            {method: 'PUT', body: document.getElementById('input-work-content').value},
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                closeLastModal()
                await waitFor(DURATION_TRANSITION_MODAL)
                window.dispatchEvent(new CustomEvent(EVENT_WORK_ADDED))
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

    <h2 class="title-modal">Çalışma Ekle</h2>

    <p class="text-modal">Yaptığınız çalışmayı açıklayın.</p>

    <div class="wrapper-modal-inputs">
        <TextArea
                type="text"
                name="input-work-content"
                title=""
                placeholder="Çalışmanızın açıklaması"
                tText="En az 10 karakter olmalı"
                rows={10}
                validate={validateWorkContent}
                bind:valid={arrFormValid[0]}
                bind:disable={$dontInterruptModal}
        />
    </div>

    <div class="m-t-button flex j-c-c wrapper-modal-buttons">
        <button disabled={$dontInterruptModal}
                class="button-nude button-nude-negative"
                class:button-nude-disabled={$dontInterruptModal}
                on:click={onCancelClick}>
            VAZGEÇ
        </button>

        <button disabled={$dontInterruptModal || !formValid}
                class:button-nude-disabled={$dontInterruptModal || !formValid}
                class="button-nude button-nude-positive"
                on:click={onAddClick}>
            KAYDET
        </button>
    </div>
</article>

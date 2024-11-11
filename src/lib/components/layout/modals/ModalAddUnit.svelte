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
    import {EVENT_UNIT_ADDED} from "$lib/js/client/events.client.js";
    import InputText from "$lib/components/InputText.svelte";
    import {formatUnitName, onValidityChange, validateUnitName} from "$lib/js/client/util.validations.client.common.js";

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
            '/api/unit/add-unit',
            {method: 'PUT', body: document.getElementById('unit-name').value},
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                closeLastModal()
                await waitFor(DURATION_TRANSITION_MODAL)
                window.dispatchEvent(new CustomEvent(EVENT_UNIT_ADDED))
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

    <h2 class="title-modal">Birim Ekle</h2>

    <p class="text-modal">Yeni birimin adını giriniz.</p>

    <div class="wrapper-modal-inputs">
        <InputText
                inputClasses="t-capitalize"
                type="text"
                title="BİRİM ADI"
                name="unit-name"
                tText="En az 2, en fazla 45 karakter olmalı"
                enterKeyHint="done"
                format={formatUnitName}
                validate={validateUnitName}
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

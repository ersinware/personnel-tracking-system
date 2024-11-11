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
    import InputText from "$lib/components/InputText.svelte";
    import {EVENT_UNIT_EDITED} from "$lib/js/client/events.client.js";
    import {formatUnitName, onValidityChange, validateUnitName} from "$lib/js/client/util.validations.client.common.js";
    import {onDestroy, onMount} from "svelte";
    import {removeTrackingFormDifference, trackFormForDifference} from "$lib/js/client/util.inputs.client.common.js";
    import {browser} from "$app/environment";

    export let unit

    const dontInterruptModal = getStore('dontInterruptModal'),
        arrFormValid = new Array(1)

    let state,
        changed,
        form

    $: formValid = onValidityChange(arrFormValid)

    onMount(_onMount)

    if (browser)
        onDestroy(_onDestroy)

    function _onMount() {
        form = document.getElementById('form-modal-edit-unit')
        trackFormForDifference(form, {'unit-name': unit.name}, onFormInput)
    }

    function _onDestroy() {
        removeTrackingFormDifference(form)
    }

    function onFormInput(same) {
        changed = !same
    }

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeLastModal()
    }

    async function onAddClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        _fetch(
            '/api/unit/edit-unit',
            {
                method: 'PUT',
                body: JSON.stringify({id: unit.id, name: document.getElementById('unit-name').value})
            },
            async (body) => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                closeLastModal()
                await waitFor(DURATION_TRANSITION_MODAL)
                window.dispatchEvent(new CustomEvent(EVENT_UNIT_EDITED))
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

<form id="form-modal-edit-unit"
      class="wrapper-modal-content flex f-column a-i-c g-v-d-modal big-screen-max-w-modal-content-small">
    <Progress bind:state forModal/>

    <h2 class="title-modal">Birimi Düzenle</h2>

    <p class="text-modal">Birimin yeni adını giriniz.</p>

    <div class="wrapper-modal-inputs">
        <InputText
                inputClasses="t-capitalize"
                type="text"
                title="BİRİM ADI"
                name="unit-name"
                tText="En az 2, en fazla 45 karakter olmalı"
                value={unit.name}
                enterKeyHint="done"
                format={formatUnitName}
                validate={validateUnitName}
                bind:valid={arrFormValid[0]}
                bind:disable={$dontInterruptModal}
        />
    </div>

    <div class="m-t-button flex j-c-c wrapper-modal-buttons">
        <button type="button"
                disabled={$dontInterruptModal}
                class="button-nude button-nude-negative"
                class:button-nude-disabled={$dontInterruptModal}
                on:click={onCancelClick}>
            VAZGEÇ
        </button>

        <button type="button"
                disabled={$dontInterruptModal || !formValid || !changed}
                class:button-nude-disabled={$dontInterruptModal || !formValid || !changed}
                class="button-nude button-nude-positive"
                on:click={onAddClick}>
            DÜZENLE
        </button>
    </div>
</form>

<script>
    import Progress from "$lib/components/Progress.svelte";
    import {_fetch, getStore, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {closeLastModal, openModal} from "$lib/js/client/util.modals.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import InputText from "$lib/components/InputText.svelte";
    import {onValidityChange, validatePassword} from "$lib/js/client/util.validations.client.common.js";
    import ModalChangeMyPasswordTwo from "$lib/components/layout/modals/ModalChangeMyPasswordTwo.svelte";

    const dontInterruptModal = getStore('dontInterruptModal'),
        arrFormValid = new Array(1)

    let state

    $: formValid = onValidityChange(arrFormValid)

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeLastModal()
    }

    async function onProceedClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        _fetch(
            '/api/user/check-password',
            {method: 'PUT', body: document.getElementById('user-password').value},
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                openModal({component: ModalChangeMyPasswordTwo})
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

    <div>
        <h2 class="title-modal">Mevcut Şifreniz</h2>
        <p class="text-hint-modal">1/2</p>
    </div>

    <p class="text-modal">Şifrenizi değiştirmek için öncelikle mevcut şifrenizi girmeniz gerekiyor.</p>

    <div class="wrapper-modal-inputs">
        <InputText
                type="password"
                title="MEVCUT ŞİFRENİZ"
                name="user-password"
                tText="En az bir küçük harf, bir büyük harf, bir rakam barındırmalı ve en az 8 karakterden oluşmalı"
                enterKeyHint="done"
                validate={validatePassword}
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
                on:click={onProceedClick}>
            DEVAM ET
        </button>
    </div>
</article>

<script>
    import Progress from "$lib/components/Progress.svelte";
    import {_fetch, getStore, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {closeLastModal} from "$lib/js/client/util.modals.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL,
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import InputText from "$lib/components/InputText.svelte";
    import {
        formatUserFullName,
        onValidityChange,
        validateEmailAddress,
        validateUserFullName
    } from "$lib/js/client/util.validations.client.common.js";

    const dontInterruptModal = getStore('dontInterruptModal'),
        arrFormValid = new Array(2)

    let state

    $: formValid = onValidityChange(arrFormValid)

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeLastModal()
    }

    async function onSendClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        _fetch(
            '/api/user/send-recover-password-link',
            {
                method: 'PUT',
                body: JSON.stringify({
                    fullName: document.getElementById('user-full-name').value,
                    email: document.getElementById('user-email-modal-recover-my-password').value
                })
            },
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                closeLastModal()
                await waitFor(DURATION_TRANSITION_MODAL)
                showPositiveSnackbar('E-posta adresinize link gönderildi. Gelen kutunuzu kontrol edin.')
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

    <h2 class="title-modal">Şifrenizi Kurtarın</h2>

    <p class="text-modal">
        Şifrenizi kurtarmanız için e-posta adresinize bir link göndereceğiz. Bunun için tam adınızı ve e-posta adresinizi giriniz.
    </p>

    <div class="wrapper-modal-inputs">
        <InputText
                inputClasses="t-capitalize"
                type="text"
                title="TAM ADINIZ"
                name="user-full-name"
                tText="En az 2, en fazla 60 karakter olmalı"
                format={formatUserFullName}
                validate={validateUserFullName}
                bind:valid={arrFormValid[0]}
                bind:disable={$dontInterruptModal}
        />

        <InputText
                type="email"
                title="E-POSTA ADRESİNİZ"
                name="user-email-modal-recover-my-password"
                tText="xxx@xxx.com formatında olmalı"
                enterKeyHint="done"
                validate={validateEmailAddress}
                bind:valid={arrFormValid[1]}
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
                on:click={onSendClick}>
            GÖNDER
        </button>
    </div>
</article>

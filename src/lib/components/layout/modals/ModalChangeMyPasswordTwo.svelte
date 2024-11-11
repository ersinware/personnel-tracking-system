<script>
    import Progress from "$lib/components/Progress.svelte";
    import {_fetch, getStore, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {closeAllModals} from "$lib/js/client/util.modals.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL,
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import InputText from "$lib/components/InputText.svelte";
    import {
        onValidityChange,
        validatePassword,
        validateSecondPassword
    } from "$lib/js/client/util.validations.client.common.js";

    const dontInterruptModal = getStore('dontInterruptModal'),
        arrFormValid = new Array(2)

    let state,
        firstPassword,
        secondPasswordCommand

    $: formValid = onValidityChange(arrFormValid)
    $: onFirstPasswordChange(firstPassword)

    function onFirstPasswordChange() {
        if (!firstPassword)
            return

        secondPasswordCommand = {type: 'checkValidation', ifExitedOnce: true}
    }

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeAllModals()
    }

    async function onChangeClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        _fetch(
            '/api/user/change-password',
            {method: 'PUT', body: document.getElementById('user-password').value},
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                closeAllModals()
                await waitFor(DURATION_TRANSITION_MODAL)
                showPositiveSnackbar('Şifreniz başarıyla değiştirildi.')
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
        <h2 class="title-modal">Yeni Şifreniz</h2>
        <p class="text-hint-modal">2/2</p>
    </div>

    <p class="text-modal">
        Güçlü bir şifre belirlemeniz, hesabınızın güvenli olması için oldukça önemlidir.
    </p>

    <div class="wrapper-modal-inputs">
        <InputText
                type="password"
                title="YENİ ŞİFRENİZ"
                name="user-password"
                tText="En az bir küçük harf, bir büyük harf, bir rakam barındırmalı ve en az 8 karakterden oluşmalı"
                validate={validatePassword}
                bind:value={firstPassword}
                bind:valid={arrFormValid[0]}
                bind:disable={$dontInterruptModal}
        />

        <InputText
                type="password"
                title="YENİ ŞİFRENİZİN ONAYI"
                name="user-password-second"
                tText="İlk girdiğiniz şifre ile aynı olmalı"
                enterKeyHint="done"
                validate={value => validateSecondPassword(firstPassword, value)}
                bind:valid={arrFormValid[1]}
                bind:command={secondPasswordCommand}
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
                on:click={onChangeClick}>

            DEĞİŞTİR
        </button>
    </div>
</article>

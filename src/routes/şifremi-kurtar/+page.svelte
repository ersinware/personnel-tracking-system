<script>
    import Progress from "$lib/components/Progress.svelte";
    import InputText from "$lib/components/InputText.svelte";
    import {_fetch, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {
        onValidityChange,
        validatePassword,
        validateSecondPassword
    } from "$lib/js/client/util.validations.client.common.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED,
        DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED,
        TRANSITION_PAGE
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {fly} from "svelte/transition";
    import {goto} from "$app/navigation";
    import {page} from "$app/stores";

    const arrFormValid = new Array(2)

    let form,
        state,
        disable,
        firstPassword,
        secondPasswordCommand

    $: formValid = onValidityChange(arrFormValid)
    $: onFirstPasswordChange(firstPassword)

    function onFirstPasswordChange() {
        if (!firstPassword)
            return

        secondPasswordCommand = {type: 'checkValidation', ifExitedOnce: true}
    }

    async function _onLinkClick(event) {
        event.preventDefault()

        await performRippleEffectAndWait(event)

        await goto("/giriş-yap", {replaceState: true});
        await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED);
    }

    async function onRecoverClick(event) {
        disable = true
        await performRippleEffectAndWait(event)

        state = 'navigating'

        _fetch(
            `/api/user/recover-password?token=${$page.url.searchParams.get('token')}`,
            {
                method: 'PUT',
                body: form.querySelector("#user-password").value,
            },
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                await goto("/giriş-yap", {replaceState: true});
                await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED);

                showPositiveSnackbar("Şifreniz başarıyla kurtarıldı.");
            },
            async (body) => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                showErrorSnackbar(body.error)
                disable = false
            }
        )
    }
</script>

<svelte:head>
    <title>Şifrenizi Kurtarın | Personel Takip Sistemi, Adıyaman Üniversitesi</title>
</svelte:head>

<div class="flex f-column a-i-c j-c-c h-100vh p-h-d">
    <form class="wrapper-modal-content p-r grid j-i-c g-v-d-modal w-100 max-w-modal-content-small color-background-second "
          bind:this={form}
          in:fly={TRANSITION_PAGE}>

        <Progress bind:state forModal/>

        <h2 class="title-modal">Şifrenizi Kurtarın</h2>

        <p class="text-modal"> Güçlü bir şifre belirlemeniz, hesabınızın güvenli olması için oldukça önemlidir.</p>

        <div class="wrapper-modal-inputs">
            <InputText
                    type="password"
                    title="YENİ ŞİFRENİZ"
                    name="user-password"
                    tText="En az bir küçük harf, bir büyük harf, bir rakam barındırmalı ve en az 8 karakterden oluşmalı"
                    validate={validatePassword}
                    bind:value={firstPassword}
                    bind:valid={arrFormValid[0]}
                    bind:disable
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
                    bind:disable
            />
        </div>

        <div class="wrapper-modal-buttons m-t-button">
            <a href="/giriş-yap"
               class="button-nude button-nude-negative"
               class:button-nude-disabled={disable}
               on:click={_onLinkClick}>

                VAZGEÇ
            </a>

            <button type="button"
                    disabled={!formValid || disable}
                    class="button-nude button-nude-positive"
                    class:button-nude-disabled={!formValid || disable}
                    on:click={onRecoverClick}>

                KURTAR
            </button>
        </div>
    </form>
</div>

<style>
    .wrapper-modal-content {
        border-radius: 1.5rem;
    }
</style>
<script>
    import Progress from "$lib/components/Progress.svelte";
    import InputText from "$lib/components/InputText.svelte";
    import {_fetch, onLinkClick, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED,
        DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED,
        TRANSITION_PAGE
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {fly} from "svelte/transition";
    import {goto} from "$app/navigation";
    import {openModal} from "$lib/js/client/util.modals.client.common.js";
    import ModalRecoverMyPassword from "$lib/components/giriş-yap/modals/ModalRecoverMyPassword.svelte";
    import {onMount} from "svelte";
    import {
        onValidityChange,
        validateEmailAddress,
        validatePassword
    } from "$lib/js/client/util.validations.client.common.js";

    const arrFormValid = new Array(2)

    let form,
        state,
        disable

    $: formValid = onValidityChange(arrFormValid)

    onMount(async () => {
        await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED)

        switch (decodeURI(window.location.search)) {
            case '?şifre-kurtarma-bileti-yok':
                showErrorSnackbar('Şifrenizi kurtarmak için gerekli olan bilete sahip değilsiniz.')

                break
            case '?şifre-kurtarma-bileti-geçersiz':
                showErrorSnackbar('Şifrenizi kurtarma biletiniz geçersiz, linkin süresi dolmuş olabilir. Daha sonra tekrar deneyin.')

                break
            case '?yetkisiz':
                showErrorSnackbar('Sayfayı görüntülemek için yetkiniz yok. Giriş yapıp tekrar deneyin.')

                break
            case '?bilinmeyen-bir-hata-meydana-geldi':
                showErrorSnackbar('Bilinmeyen bir hata meydana geldi. Daha sonra tekrar deneyin.')

                break
        }
    })

    async function onRecoverPasswordClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalRecoverMyPassword})
    }

    async function onSignInClick(event) {
        disable = true
        await performRippleEffectAndWait(event)

        state = 'navigating'

        _fetch(
            '/api/user/sign-in',
            {
                method: 'PUT',
                body: JSON.stringify({
                    email: form.querySelector("#user-email").value,
                    password: form.querySelector("#user-password").value,
                }),
            },
            async () => {
                state = 'navigated'
                await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                await goto("/", {replaceState: true});
                await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED);

                showPositiveSnackbar("Oturumunuz başarıyla başlatıldı.");
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
    <title>Giriş Yap | Personel Takip Sistemi, Adıyaman Üniversitesi</title>
</svelte:head>

<div class="flex f-column a-i-c j-c-c h-100vh p-h-d">
    <form class="wrapper-modal-content p-r grid j-i-c g-v-d-modal w-100 max-w-modal-content-small color-background-second"
          bind:this={form}
          in:fly={TRANSITION_PAGE}>

        <Progress bind:state forModal/>

        <h2 class="title-modal">Tekrar Hoşgeldiniz</h2>

        <div>
            <p class="text-modal"> Şifrenizi mi unuttunuz?</p>

            <button disabled={disable}
                    type="button"
                    class="text-link text-4 f-w-600 m-h-auto"
                    class:button-nude-disabled={disable}
                    on:click={onRecoverPasswordClick}>

                Şifremi Kurtar
            </button>
        </div>

        <div class="wrapper-modal-inputs">
            <InputText
                    type="email"
                    title="E-POSTA ADRESİNİZ"
                    name="user-email"
                    tText="xxx@xxx.com formatında olmalı"
                    validate={validateEmailAddress}
                    bind:valid={arrFormValid[0]}
                    bind:disable={disable}
            />

            <InputText
                    type="password"
                    title="ŞİFRENİZ"
                    name="user-password"
                    tText="En az bir küçük harf, bir büyük harf, bir rakam barındırmalı ve en az 8 karakterden oluşmalı"
                    validate={validatePassword}
                    enterKeyHint="done"
                    bind:valid={arrFormValid[1]}
                    bind:disable={disable}
            />
        </div>

        <div class="wrapper-modal-buttons m-t-button">
            <a href="/"
               class="button-nude button-nude-negative"
               class:button-nude-disabled={disable}
               on:click={onLinkClick}>

                VAZGEÇ
            </a>

            <button type="button"
                    disabled={!formValid || disable}
                    class="button-nude button-nude-positive"
                    class:button-nude-disabled={!formValid || disable}
                    on:click={onSignInClick}>

                GİRİŞ YAP
            </button>
        </div>
    </form>
</div>

<style>
    .wrapper-modal-content {
        border-radius: 1.5rem;
    }
</style>
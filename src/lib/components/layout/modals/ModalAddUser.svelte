<script>
    import Progress from "$lib/components/Progress.svelte";
    import {_fetch, getStore, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {closeAllModals, closeLastModal, openModal} from "$lib/js/client/util.modals.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL,
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import InputText from "$lib/components/InputText.svelte";

    import {
        formatUserFullName,
        onValidityChange,
        validateEmailAddress,
        validateUserFullName
    } from "$lib/js/client/util.validations.client.common.js";
    import ModalAddUserTwo from "$lib/components/layout/modals/ModalAddUserTwo.svelte";
    import {onMount} from "svelte";
    import {page} from "$app/stores";
    import {EVENT_USER_ADDED} from "$lib/js/client/events.client.js";

    const dontInterruptModal = getStore('dontInterruptModal'),
        holder = getStore('holder'),
        arrFormValid = new Array(2)

    let state

    $: formValid = onValidityChange(arrFormValid)

    onMount(() => {
        if ($page.data.user.role === 0)
            _fetch(
                '/api/unit/get-all-units',
                {method: 'GET'},
                (body) => {
                    $holder.units = body.units
                },
                () => {
                    $holder.units = []
                }
            )
    })

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeLastModal()
    }

    async function onProceedClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        if ($page.data.user.role === 0)
            _fetch(
                '/api/user/check-existence',
                {
                    method: 'PUT',
                    body: document.getElementById('user-email').value
                },
                async () => {
                    state = 'navigated'
                    await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                    $holder.fullName = document.getElementById('user-full-name').value
                    $holder.email = document.getElementById('user-email').value

                    openModal({component: ModalAddUserTwo})
                },
                async (body) => {
                    state = 'navigated'
                    await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                    $dontInterruptModal = false
                    showErrorSnackbar(body.error)
                }
            )
        else
            _fetch(
                '/api/user/add-user',
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        fullName: document.getElementById('user-full-name').value,
                        email: document.getElementById('user-email').value
                    })
                },
                async (body) => {
                    state = 'navigated'
                    await waitFor(DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED)

                    closeAllModals()
                    await waitFor(DURATION_TRANSITION_MODAL)
                    window.dispatchEvent(new CustomEvent(EVENT_USER_ADDED))
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
        <h2 class="title-modal">Kullanıcı Ekle</h2>

        {#if $page.data.user.role === 0}
            <p class="text-hint-modal">1/2</p>
        {/if}
    </div>

    <p class="text-modal">Eklemek istediğiniz yeni kullacının tam adını ve e-posta adresini giriniz.</p>

    <div class="wrapper-modal-inputs">
        <InputText
                inputClasses="t-capitalize"
                type="text"
                title="TAM ADI"
                name="user-full-name"
                value={$holder.fullName}
                tText="En az 2, en fazla 60 karakter olmalı"
                format={formatUserFullName}
                validate={validateUserFullName}
                bind:valid={arrFormValid[0]}
                bind:disable={$dontInterruptModal}
        />

        <InputText
                type="email"
                title="E-POSTA ADRESİ"
                name="user-email"
                value={$holder.email}
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
                on:click={onProceedClick}>
            {#if $page.data.user.role === 0}
                DEVAM ET
            {:else}
                KAYDET
            {/if}
        </button>
    </div>
</article>

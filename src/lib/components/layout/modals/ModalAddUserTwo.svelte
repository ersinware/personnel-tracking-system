<script>
    import Progress from "$lib/components/Progress.svelte";
    import {_fetch, getStore, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {closeAllModals} from "$lib/js/client/util.modals.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {
        DURATION_TRANSITION_MODAL,
        DURATION_TRANSITION_MODAL_PROGRESS_BAR_NAVIGATED
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {EVENT_USER_ADDED} from "$lib/js/client/events.client.js";
    import {onValidityChange} from "$lib/js/client/util.validations.client.common.js";
    import ModalUnitSearchBox from "$lib/components/users/modals/ModalUnitSearchBox.svelte";
    import Switch from "$lib/components/Switch.svelte";

    const dontInterruptModal = getStore('dontInterruptModal'),
        holder = getStore('holder'),
        arrFormValid = new Array(1)

    let state

    $: formValid = onValidityChange(arrFormValid)

    async function onCancelClick(event) {
        await performRippleEffectAndWait(event)

        closeAllModals()
    }

    async function onSaveClick(event) {
        state = 'navigating'
        $dontInterruptModal = true

        await performRippleEffectAndWait(event)

        _fetch(
            '/api/user/add-user',
            {
                method: 'PUT',
                body: JSON.stringify({
                    fullName: $holder.fullName,
                    email: $holder.email,
                    unitId: document.getElementById('input-unit-id').value,
                    role: document.getElementById('input-user-role').checked ? 1 : 2
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
        <h2 class="title-modal">Kullanıcı Birimi</h2>
        <p class="text-hint-modal">2/2</p>
    </div>

    <p class="text-modal">Eklemek istediğiniz yeni kullanıcının birimini ve yetki durumunu seçiniz.</p>

    <div class="wrapper-modal-inputs">
        <article id="wrapper-switch" class="flex a-i-c g-1 color-background-second b-r-d">
            <Switch id="input-user-role"
                    bind:disabled={$dontInterruptModal}/>

            <label for="input-user-role"
                   class="text-5 l-h-1-dot-25"
                   class:pointer={!$dontInterruptModal}
                   style={$dontInterruptModal ? 'color: var(--color-text-unimportant) !important' : ''}
            >
                Kullanıcı birim yöneticisi olsun
            </label>
        </article>

        <div class="h-divider m-h-auto"></div>

        <ModalUnitSearchBox
                _units={$holder.units}
                bind:valid={arrFormValid[0]}
                bind:disable={$dontInterruptModal}/>
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
                on:click={onSaveClick}>
            KAYDET
        </button>
    </div>
</article>

<style>
    #wrapper-switch {
        padding-block: 1rem;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }

    .h-divider {
        margin-top: .75rem;
        margin-bottom: .475rem;

        width: calc(100% - var(--border-radius) * .5);
    }

    label {
        transition: color .25s ease-in-out;
    }
</style>
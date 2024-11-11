<script>
    import PanelLeftMenuBigScreen from "$lib/components/layout/big-screen/PanelLeftMenuBigScreen.svelte";
    import PanelHeaderSmallScreen from "$lib/components/layout/small-screen/PanelHeaderSmallScreen.svelte";
    import PanelLeftMenuSmallScreen from "$lib/components/layout/small-screen/PanelLeftMenuSmallScreen.svelte";
    import {onDestroy, onMount} from "svelte";
    import {browser} from "$app/environment";
    import {EVENT_UNIT_ADDED, EVENT_USER_ADDED, EVENT_WORK_ADDED} from "$lib/js/client/events.client.js";
    import {invalidate} from "$app/navigation";
    import {DURATION_TRANSITION_AFTER_CONTENT_CHANGED} from "$lib/js/client/constants.transitions.client.common.js";
    import {showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";

    onMount(_onMount)

    if (browser)
        onDestroy(_onDestroy)

    function _onMount() {
        window.addEventListener(EVENT_UNIT_ADDED, onUnitAdded)
        window.addEventListener(EVENT_USER_ADDED, onUserAdded)
        window.addEventListener(EVENT_WORK_ADDED, onWorkAdded)
    }

    function _onDestroy() {
        window.removeEventListener(EVENT_UNIT_ADDED, onUnitAdded)
        window.removeEventListener(EVENT_USER_ADDED, onUserAdded)
        window.removeEventListener(EVENT_WORK_ADDED, onWorkAdded)
    }

    async function onUnitAdded() {
        await invalidate('app:birimler')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Birim başarıyla eklendi.')
    }

    async function onUserAdded() {
        await invalidate('app:kullanıcılar')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Kullanıcı başarıyla eklendi ve e-posta adresine otomatik oluşturulmuş şifresi gönderildi.')
    }

    async function onWorkAdded() {
        await invalidate('app:çalışmalar')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Çalışma başarıyla eklendi.')
    }
</script>

<PanelLeftMenuBigScreen/>

<PanelHeaderSmallScreen/>
<PanelLeftMenuSmallScreen/>

<div class="b-box w-100vw big-screen-p-v-d-page big-screen-p-h-left-menu small-screen-p-t-header small-screen-p-h-d">
    <main class="max-w-page m-h-auto">
        <slot/>
    </main>
</div>
<script>
    import '$lib/css/common/big.screen.common.css'
    import '$lib/css/common/colors.common.css'
    import '$lib/css/common/common.css'
    import '$lib/css/common/gaps.common.css'
    import '$lib/css/common/inputs.common.css'
    import '$lib/css/common/layout.properties.css'
    import '$lib/css/common/modals.common.css'
    import '$lib/css/common/padding.and.margin.common.css'
    import '$lib/css/common/project.buttons.common.css'
    import '$lib/css/common/project.colors.common.css'
    import '$lib/css/common/project.common.css'
    import '$lib/css/common/project.flex.common.css'
    import '$lib/css/common/project.fonts.common.css'
    import '$lib/css/common/project.grid.common.css'
    import '$lib/css/common/project.images.common.css'
    import '$lib/css/common/project.inputs.common.css'
    import '$lib/css/common/small.screen.common.css'
    import '$lib/css/common/text.properties.common.css'
    import '$lib/css/common/texts.common.css'
    import '$lib/css/common/width.and.height.common.css'

    import '$lib/css/panel/fab.panel.css'
    import '$lib/css/panel/header.small.screen.css'
    import '$lib/css/panel/left.menu.big.screen.panel.css'
    import '$lib/css/panel/project.inputs.panel.css'

    import {afterNavigate, beforeNavigate} from "$app/navigation"
    import {createStore, getStore, init as initUtil, yieldToMain} from "$lib/js/client/util.client.common.js"
    import {browser} from "$app/environment"
    import {init as initUtilInputs} from "$lib/js/client/util.inputs.client.common.js"
    import {init as initUtilLamp} from "$lib/js/client/util.lamp.client.common.js"
    import {
        init as initSnackbars,
        showErrorSnackbar,
        showPositiveSnackbar
    } from "$lib/js/client/util.snackbars.client.common.js"
    import {init as initUtilResponsive} from "$lib/js/client/util.responsive.client.common.js"
    import {anyOpenModal, closeLastModal, init as initUtilModals,} from "$lib/js/client/util.modals.client.common.js"
    import {onMount} from "svelte";
    import {ERROR_NO_INTERNET_CONNECTION, ONLINE_BACK} from "$lib/js/client/constants.client.common.js";
    import DynamicModals from "$lib/components/DynamicModals.svelte";
    import Lamp from "$lib/components/Lamp.svelte";
    import Ripple from "$lib/components/Ripple.svelte";
    import Snackbars from "$lib/components/snackbar/Snackbars.svelte";
    import Progress from "$lib/components/Progress.svelte";
    import {init as initLeftMenuSmallScreen} from "$lib/js/client/left.menu.small.screen.client.js";
    import {EVENT_URL_CHANGING} from "$lib/js/client/events.client.js";

    createStores()

    const navigationState = getStore("navigationState"),
        dontInterruptModal = getStore("dontInterruptModal")

    let firstTime = true,
        urlChanging

    if (browser)
        init()

    onMount(_onMount)
    beforeNavigate(_beforeNavigate)
    afterNavigate(_afterNavigate)

    function createStores() {
        createStore("touchable")
        createStore("hoverable")
        createStore("bigScreen")
        createStore("navigationState")
        createStore("rippleTargetInfo")
        createStore("openSnackbars", [])
        createStore("openModals", [])
        createStore("openDynamicModals", [])
        createStore("dontInterruptModal")
        createStore("holder", {})
        createStore("openLeftMenu")
    }

    function init() {
        const bigScreen = getStore("bigScreen")

        initUtil(getStore("rippleTargetInfo"), dontInterruptModal)
        initUtilLamp(dontInterruptModal)
        initUtilInputs(dontInterruptModal)
        initSnackbars(getStore("openSnackbars"), bigScreen)
        initUtilModals(getStore("openModals"), getStore("openDynamicModals"), getStore('holder'), dontInterruptModal)
        initUtilResponsive(getStore("touchable"), getStore("hoverable"), bigScreen)
        initLeftMenuSmallScreen(getStore("openLeftMenu"))
    }

    async function _onMount() {
        await navigator.serviceWorker.ready;
        navigator.serviceWorker.addEventListener("message", onMessageFromServiceWorker)

        window.addEventListener(
            EVENT_URL_CHANGING,
            async () => {
                urlChanging = true
                await yieldToMain()
                urlChanging = false
            }
        )
    }

    function _beforeNavigate({type, cancel}) {
        if (urlChanging)
            return

        if (type === "popstate") {
            if ($dontInterruptModal) {
                cancel()

                return
            }

            if (anyOpenModal()) {
                closeLastModal()
                cancel()

                return
            }
        }

        if (type !== "leave")
            $navigationState = "navigating"
    }

    function _afterNavigate() {
        if (firstTime) {
            firstTime = false

            return
        }

        if (urlChanging)
            return

        $navigationState = "navigated"
    }

    async function onMessageFromServiceWorker(event) {
        switch (event.data.type) {
            case ERROR_NO_INTERNET_CONNECTION:
                showErrorSnackbar("İnternet bağlantınız koptu. Bazı fonksiyonlar çalışmayabilir.")

                break;
            case ONLINE_BACK:
                showPositiveSnackbar("Tekrar çevrimiçi oldunuz.");

                break;
        }
    }
</script>

<slot></slot>

<DynamicModals/>
<Lamp/>
<Ripple/>
<Snackbars/>
<Progress bind:state={$navigationState}/>
<script>
    import {page} from "$app/stores";
    import {
        DURATION_TRANSITION_PAGE,
        DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED,
        TRANSITION_PAGE
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {
        _fetch,
        getStore,
        onLinkClick,
        performRippleEffectAndWait,
        sendMessageToWorker,
        yieldToMain,
    } from "$lib/js/client/util.client.common.js";
    import {fly, slide} from "svelte/transition";
    import {cubicInOut} from "svelte/easing";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {goto} from "$app/navigation";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {openModal} from "$lib/js/client/util.modals.client.common.js";
    import ModalAddUnit from "$lib/components/layout/modals/ModalAddUnit.svelte";
    import ModalAddUser from "$lib/components/layout/modals/ModalAddUser.svelte";
    import ModalChangeMyPassword from "$lib/components/layout/modals/ModalChangeMyPassword.svelte";
    import {EVENT_CLEAR_PROTECTED_CACHE} from "$lib/js/client/constants.client.common.js";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ModalAddWork from "$lib/components/layout/modals/ModalAddWork.svelte";

    const TRANSITION_LEFT_MENU_ICON_BUTTON = {delay: DURATION_TRANSITION_PAGE, duration: 500, easing: cubicInOut},
        navigationState = getStore('navigationState')

    let delayedURL = decodeURI($page.url.pathname)

    $: onURLChange($page.url.pathname)

    async function onURLChange() {
        await yieldToMain()
        delayedURL = decodeURI($page.url.pathname)
    }

    async function onAddWorkClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalAddWork})
    }

    async function onAddUnitClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalAddUnit})
    }

    async function onAddUserClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalAddUser, addToBackstack: true})
    }

    async function onChangeMyPasswordClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalChangeMyPassword, addToBackstack: true})
    }

    async function onSignOutClick(event) {
        $navigationState = 'navigating'
        await performRippleEffectAndWait(event)

        _fetch(
            '/api/user/sign-out',
            {method: 'DELETE'},
            async () => {
                $navigationState = 'navigated'
                await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED)

                await goto('/giriş-yap', {replaceState: true})
                await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED)

                showPositiveSnackbar("Oturumunuz başarıyla kapatıldı.")
                sendMessageToWorker({type: EVENT_CLEAR_PROTECTED_CACHE})
            },
            async (body) => {
                $navigationState = 'navigated'
                await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED)

                showErrorSnackbar(body.error)
            }
        )
    }
</script>

<aside class="wrapper-base-left-menu-big-screen p-f flex f-column g-v-d p-v-d-page big-screen-o-y-scroll for-big-screen"
       in:fly={TRANSITION_PAGE}>

    <article class="wrapper-left-menu-big-screen flex f-column a-i-c b-r-d b-shadow">
        <article class="wrapper-icon-left-menu-big-screen">
            <Tooltip text="Anasayfa" left>
                <a href="/" on:click={onLinkClick}>
                    <svg class="icon-left-menu-big-screen"
                         class:icon-active-left-menu-big-screen={decodeURI($page.url.pathname) === "/"}
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 576 512">

                        <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
                    </svg>
                </a>
            </Tooltip>
        </article>

        {#if delayedURL === '/'}
            <article id="wrapper-icon-add-unit-left-menu-big-screen"
                     class="wrapper-icon-left-menu-big-screen"
                     transition:slide={TRANSITION_LEFT_MENU_ICON_BUTTON}>

                <Tooltip classes="nowrap" text="Çalışma Ekle" left>
                    <button on:click={onAddWorkClick}>
                        <svg id="icon-add-unit-left-menu-big-screen"
                             class="icon-left-menu-big-screen"
                             class:icon-active-left-menu-big-screen={decodeURI($page.url.pathname) === '/'}
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 512 512">

                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                        </svg>
                    </button>
                </Tooltip>
            </article>
        {/if}

        {#if [0, 1].includes($page.data.user.role)}
            <article class="wrapper-icon-left-menu-big-screen">
                <Tooltip text="Personel Çalışmaları" left --tooltip-white-space="nowrap">
                    <a href="/personel-çalışmaları" on:click={onLinkClick}>
                        <svg class="icon-left-menu-big-screen"
                             class:icon-active-left-menu-big-screen={['/personel-çalışmaları', '/personel-çalışmaları/'].includes(decodeURI($page.url.pathname))}
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 448 512">

                            <path d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 48L0 160l0-48C0 85.5 21.5 64 48 64l48 0 0-32c0-17.7 14.3-32 32-32zM0 192l448 0 0 272c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 192zM329 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-95 95-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L329 305z"/>
                        </svg>
                    </a>
                </Tooltip>
            </article>
        {/if}

        {#if $page.data.user.role === 0}
            <article class="wrapper-icon-left-menu-big-screen">
                <Tooltip text="Birimler" left>
                    <a href="/birimler" on:click={onLinkClick}>
                        <svg class="icon-left-menu-big-screen"
                             class:icon-active-left-menu-big-screen={['/birimler', '/birimler/'].includes($page.url.pathname)}
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 576 512">
                            <path d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z"/>
                        </svg>
                    </a>
                </Tooltip>
            </article>

            {#if ['/birimler', '/birimler/'].includes(delayedURL)}
                <article id="wrapper-icon-add-unit-left-menu-big-screen"
                         class="wrapper-icon-left-menu-big-screen"
                         transition:slide={TRANSITION_LEFT_MENU_ICON_BUTTON}>

                    <Tooltip classes="nowrap" text="Birim Ekle" left>
                        <button on:click={onAddUnitClick}>
                            <svg id="icon-add-unit-left-menu-big-screen"
                                 class="icon-left-menu-big-screen"
                                 class:icon-active-left-menu-big-screen={['/birimler', '/birimler/'].includes($page.url.pathname)}
                                 xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 512 512">

                                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                            </svg>
                        </button>
                    </Tooltip>
                </article>
            {/if}
        {/if}

        {#if [0, 1].includes($page.data.user.role)}
            <article class="wrapper-icon-left-menu-big-screen">
                <Tooltip text="Kullanıcılar" left>
                    <a href="/kullanıcılar" on:click={onLinkClick}>
                        <svg id="icon-users-left-menu-big-screen"
                             class="icon-left-menu-big-screen"
                             class:icon-active-left-menu-big-screen={['/kullanıcılar', '/kullanıcılar/'].includes(decodeURI($page.url.pathname))}
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 512 512">
                            <path d="M256 288A144 144 0 1 0 256 0a144 144 0 1 0 0 288zm-94.7 32C72.2 320 0 392.2 0 481.3c0 17 13.8 30.7 30.7 30.7l450.6 0c17 0 30.7-13.8 30.7-30.7C512 392.2 439.8 320 350.7 320l-189.4 0z"/>
                        </svg>
                    </a>
                </Tooltip>
            </article>

            {#if ['/kullanıcılar', '/kullanıcılar/'].includes(delayedURL)}
                <article id="wrapper-icon-add-user-left-menu-big-screen"
                         class="wrapper-icon-left-menu-big-screen"
                         transition:slide={TRANSITION_LEFT_MENU_ICON_BUTTON}>

                    <Tooltip classes="nowrap" text="Kullanıcı Ekle" left>
                        <button on:click={onAddUserClick}>
                            <svg id="icon-add-user-left-menu-big-screen"
                                 class="icon-left-menu-big-screen"
                                 class:icon-active-left-menu-big-screen={['/kullanıcılar', '/kullanıcılar/'].includes(decodeURI($page.url.pathname))}
                                 xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 512 512">

                                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                            </svg>
                        </button>
                    </Tooltip>
                </article>
            {/if}
        {/if}

        <article class="wrapper-icon-left-menu-big-screen">
            <Tooltip classes="nowrap" text="Şifremi Değiştir" left>
                <button on:click={onChangeMyPasswordClick}>
                    <svg id="icon-change-my-password-left-menu-big-screen"
                         class="icon-left-menu-big-screen"
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 448 512">

                        <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/>
                    </svg>
                </button>
            </Tooltip>
        </article>

        <article class="wrapper-icon-left-menu-big-screen">
            <Tooltip classes="nowrap" text="Çıkış Yap" left>
                <button on:click={onSignOutClick}>
                    <svg class="icon-left-menu-big-screen icon-error-left-menu-big-screen"
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 512 512">
                        <path transform="rotate(180 256 256)"
                              d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>
                    </svg>
                </button>
            </Tooltip>
        </article>
    </article>
</aside>

<style>
    .wrapper-icon-left-menu-big-screen {
        --tooltip-distance: var(--width-left-menu-big-screen);
        --color-text-tooltip: var(--color-text-second);
        --background-color-tooltip: var(--color-background-third);
    }


    #wrapper-icon-add-unit-left-menu-big-screen,
    #wrapper-icon-add-user-left-menu-big-screen {
        margin-top: .75rem;
        margin-bottom: .75rem;
    }

    #icon-add-unit-left-menu-big-screen,
    #icon-add-user-left-menu-big-screen {
        width: 1.475rem;
        height: 1.5rem;
    }

    #icon-users-left-menu-big-screen {
        width: 1.225rem;
    }

    #icon-change-my-password-left-menu-big-screen {
        width: 1.275rem;
        margin-left: -.05rem;
    }
</style>
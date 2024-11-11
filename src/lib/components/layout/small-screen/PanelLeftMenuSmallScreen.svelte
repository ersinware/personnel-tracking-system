<script>
    import {
        _fetch,
        getStore,
        performRippleEffectAndWait,
        sendMessageToWorker
    } from "$lib/js/client/util.client.common.js";
    import {cubicInOut} from "svelte/easing";
    import {fly} from "svelte/transition";
    import {
        DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN,
        DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {closeLeftMenu} from "$lib/js/client/left.menu.small.screen.client.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {openModal} from "$lib/js/client/util.modals.client.common.js";
    import ModalAddUnit from "$lib/components/layout/modals/ModalAddUnit.svelte";
    import ModalAddUser from "$lib/components/layout/modals/ModalAddUser.svelte";
    import ModalChangeMyPassword from "$lib/components/layout/modals/ModalChangeMyPassword.svelte";
    import {EVENT_CLEAR_PROTECTED_CACHE} from "$lib/js/client/constants.client.common.js";
    import ModalAddWork from "$lib/components/layout/modals/ModalAddWork.svelte";

    const openLeftMenu = getStore('openLeftMenu');

    let signingOut

    async function _onLinkClick(event) {
        event.preventDefault()

        const href = event.currentTarget.href

        await performRippleEffectAndWait(event)

        closeLeftMenu()
        await waitFor(DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN)

        goto(href)
    }

    async function onAddWorkClick(event) {
        await performRippleEffectAndWait(event)

        closeLeftMenu(true)
        await waitFor(DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN / 2)

        openModal({component: ModalAddWork})
    }

    async function onAddUnitClick(event) {
        await performRippleEffectAndWait(event)

        closeLeftMenu(true)
        await waitFor(DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN / 2)

        openModal({component: ModalAddUnit})
    }

    async function onAddUserClick(event) {
        await performRippleEffectAndWait(event)

        closeLeftMenu(true)
        await waitFor(DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN / 2)

        openModal({component: ModalAddUser, addToBackstack: true})
    }

    async function onChangeMyPasswordClick(event) {
        await performRippleEffectAndWait(event)

        closeLeftMenu(true)
        await waitFor(DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN / 2)

        openModal({component: ModalChangeMyPassword, addToBackstack: true})
    }

    async function onSignOutClick(event) {
        if (signingOut)
            return

        signingOut = true

        await performRippleEffectAndWait(event)

        showPositiveSnackbar('Oturumunuz kapatılıyor...')

        _fetch(
            '/api/user/sign-out',
            {method: 'DELETE'},
            async () => {
                closeLeftMenu()
                await waitFor(DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN)

                await goto('/giriş-yap', {replaceState: true})
                await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED)

                showPositiveSnackbar("Oturumunuz başarıyla kapatıldı.")
                sendMessageToWorker({type: EVENT_CLEAR_PROTECTED_CACHE})
            },
            async (body) => {
                signingOut = false
                showErrorSnackbar(body.error)
            }
        )
    }
</script>

{#if $openLeftMenu}
    <aside id="left-menu"
           class="b-box p-f t-0 l-0 flex f-column g-v-d w-h-100 max-h-100 p-d color-background o-y-scroll for-small-screen"
           transition:fly={{x: '-1rem', easing: cubicInOut, duration: DURATION_TRANSITION_LEFT_MENU_SMALL_SCREEN}}>

        <p id="text-hint-pages" class="text-hint-3 color-text-unimportant f-w-700">SAYFALAR</p>

        <div class="grid g-1dot75">
            <a href="/"
               class="flex a-i-c g-1"
               on:click={_onLinkClick}>

                <svg class="icon-left-menu-small-screen"
                     class:active-icon-left-menu-small-screen={$page.url.pathname === '/'}
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 576 512">

                    <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
                </svg>

                <p id="text-link-homepage-left-menu-small-screen"
                   class="text-4 l-h-1"
                   class:active-text-link-left-menu-small-screen={$page.url.pathname === '/'}>

                    Anasayfa
                </p>
            </a>

            {#if [0, 1].includes($page.data.user.role)}
                <a href="/personel-çalışmaları"
                   class="flex a-i-c g-1"
                   on:click={_onLinkClick}>

                    <svg id="icon-staff-works-left-menu-small-screen"
                         class="icon-left-menu-small-screen b-box"
                         class:active-icon-left-menu-small-screen={['/personel-çalışmaları', '/personel-çalışmaları/'].includes(decodeURI($page.url.pathname))}
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 448 512">

                        <path d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 48L0 160l0-48C0 85.5 21.5 64 48 64l48 0 0-32c0-17.7 14.3-32 32-32zM0 192l448 0 0 272c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 192zM329 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-95 95-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L329 305z"/>
                    </svg>

                    <p class="text-4 l-h-1"
                       class:active-text-link-left-menu-small-screen={['/personel-çalışmaları', '/personel-çalışmaları/'].includes(decodeURI($page.url.pathname))}>

                        Personel Çalışmaları
                    </p>
                </a>
            {/if}

            {#if $page.data.user.role === 0}
                <a href="/birimler"
                   class="flex a-i-c g-1"
                   on:click={_onLinkClick}>

                    <svg class="icon-left-menu-small-screen"
                         class:active-icon-left-menu-small-screen={['/birimler', '/birimler/'].includes($page.url.pathname)}
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 576 512">
                        <path d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z"/>
                    </svg>

                    <p class="text-4 l-h-1"
                       class:active-text-link-left-menu-small-screen={['/birimler', '/birimler/'].includes($page.url.pathname)}>

                        Birimler
                    </p>
                </a>
            {/if}

            {#if [0, 1].includes($page.data.user.role)}
                <a href="/kullanıcılar"
                   class="flex a-i-c g-1"
                   on:click={_onLinkClick}>

                    <svg id="icon-users-left-menu-small-screen"
                         class="icon-left-menu-small-screen b-box"
                         class:active-icon-left-menu-small-screen={['/kullanıcılar', '/kullanıcılar/'].includes(decodeURI($page.url.pathname))}
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 512 512">

                        <path d="M256 288A144 144 0 1 0 256 0a144 144 0 1 0 0 288zm-94.7 32C72.2 320 0 392.2 0 481.3c0 17 13.8 30.7 30.7 30.7l450.6 0c17 0 30.7-13.8 30.7-30.7C512 392.2 439.8 320 350.7 320l-189.4 0z"/>
                    </svg>

                    <p class="text-4 l-h-1"
                       class:active-text-link-left-menu-small-screen={['/kullanıcılar', '/kullanıcılar/'].includes(decodeURI($page.url.pathname))}>

                        Kullanıcılar
                    </p>
                </a>
            {/if}
        </div>

        <p id="text-hint-actions" class="text-hint-3 color-text-unimportant f-w-700">AKSİYONLAR</p>

        <div class="grid g-1dot75">
            <button class="flex a-i-c g-1" on:click={onAddWorkClick}>
                <svg class="icon-left-menu-small-screen"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 512 512">

                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                </svg>

                <span class="d-block text-4 l-h-1">Çalışma Ekle</span>
            </button>

            {#if $page.data.user.role === 0}
                <button class="flex a-i-c g-1" on:click={onAddUnitClick}>
                    <svg class="icon-left-menu-small-screen"
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 512 512">

                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                    </svg>

                    <span class="d-block text-4 l-h-1">Birim Ekle</span>
                </button>
            {/if}

            {#if [0, 1].includes($page.data.user.role)}
                <button class="flex a-i-c g-1" on:click={onAddUserClick}>
                    <svg class="icon-left-menu-small-screen"
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 512 512">

                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                    </svg>

                    <span class="d-block text-4 l-h-1">Kullanıcı Ekle</span>
                </button>
            {/if}

            <button class="flex a-i-c g-1" on:click={onChangeMyPasswordClick}>
                <svg id="icon-change-my-password-left-menu-small-screen"
                     class="icon-left-menu-small-screen b-box"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 448 512">

                    <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/>
                </svg>

                <span class="d-block text-4 l-h-1">Şifremi Değiştir</span>
            </button>

            <button class="flex a-i-c g-1" on:click={onSignOutClick}>
                <svg id="icon-sign-out-left-menu-small-screen"
                     class="icon-left-menu-small-screen icon-error-left-menu-big-screen"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 512 512">
                    <path transform="rotate(180 256 256)"
                          d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>
                </svg>

                <span class="d-block text-4 l-h-1">Çıkış Yap</span>
            </button>
        </div>

        <img id="image-flower" src="/flower.svg" alt="Vazo | Dijital Almanak, Adıyaman Üniversitesi">
    </aside>
{/if}

<style>
    #left-menu {
        z-index: 101;

        max-width: min(22.5rem, 75%);
    }

    #text-hint-pages {
        margin-top: 1.75rem;
    }

    .icon-left-menu-small-screen {
        width: 1.675rem;
        height: 1.675rem;

        fill: var(--color-university) !important;
    }

    .active-icon-left-menu-small-screen {
        fill: var(--color-accent) !important;
    }

    .active-text-link-left-menu-small-screen {
        color: var(--color-accent) !important;
    }

    #text-link-homepage-left-menu-small-screen {
        margin-bottom: -.1rem;
    }

    #icon-staff-works-left-menu-small-screen {
        padding: .05rem;
    }

    #icon-users-left-menu-small-screen {
        padding-left: .15rem;
        padding-right: .15rem;
        padding-bottom: .1rem;

        margin-left: -.05rem;
        margin-right: .05rem;
    }

    #text-hint-actions {
        margin-top: 1.5rem;
    }

    #icon-change-my-password-left-menu-small-screen {
        padding-right: .15rem;
        padding-left: .15rem;

    }

    #icon-sign-out-left-menu-small-screen {
        height: 1.5rem;
        padding-top: .175rem;
        padding-left: .1rem;
        margin-right: -.1rem;
    }

    #image-flower {
        margin-top: auto;
        padding-top: var(--p-v);
    }
</style>
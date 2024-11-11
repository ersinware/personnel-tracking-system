<script>
    import {
        DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
        TRANSITION_FAB,
        TRANSITION_PAGE
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {fade, fly} from "svelte/transition";
    import {_fetch, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {openModal} from "$lib/js/client/util.modals.client.common.js";
    import {onDestroy, onMount} from "svelte";
    import {browser} from "$app/environment";
    import {EVENT_URL_CHANGING, EVENT_USER_ADDED, EVENT_USER_REMOVED} from "$lib/js/client/events.client.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {cubicInOut} from "svelte/easing";
    import {flip} from "svelte/animate";
    import {waitFor} from "$lib/js/common/util.common.js";
    import ModalAddUser from "$lib/components/layout/modals/ModalAddUser.svelte";
    import ModalRemoveUser from "$lib/components/users/modals/ModalRemoveUser.svelte";
    import InputText from "$lib/components/InputText.svelte";
    import {page} from "$app/stores";
    import {goto, invalidate} from "$app/navigation";
    import {addIntersectionObserver} from "$lib/js/client/util.observation.client.common.js";

    export let data

    let _page = Number($page.url.searchParams.get('sayfa')) || 1,
        searchTimeout,
        fetching,
        removing,
        adding

    $: TRANSITION_OUT_USER = (() => {
        if (removing)
            return {
                duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
                easing: cubicInOut
            }

        return {duration: 0}
    })()

    $: TRANSITION_IN_USER = (() => {
        if (adding)
            return {
                y: 0,
                delay: DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
                duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
                easing: cubicInOut
            }

        return {
            ...TRANSITION_PAGE,
            duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
        }
    })()

    onMount(_onMount)

    if (browser)
        onDestroy(_onDestroy)

    function _onMount() {
        window.addEventListener(EVENT_USER_REMOVED, onUserRemoved)
        window.addEventListener(EVENT_USER_ADDED, onUserAdded)
    }

    function _onDestroy() {
        window.removeEventListener(EVENT_USER_REMOVED, onUserRemoved)
        window.removeEventListener(EVENT_USER_ADDED, onUserAdded)
    }

    async function onUserRemoved() {
        removing = true

        await invalidate('app:kullanıcılar')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Kullanıcı başarıyla silindi.')

        removing = false
    }

    async function onUserAdded() {
        adding = true
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED * 2)
        adding = false
    }

    async function onFilter() {
        clearTimeout(searchTimeout)

        searchTimeout = setTimeout(
            async () => {
                const searchUserFullName = document.getElementById('input-user-full-name').value,
                    searchParams = new URLSearchParams($page.url.searchParams)

                if (searchUserFullName)
                    searchParams.set('kullanıcı-adı', searchUserFullName)
                else
                    searchParams.delete('kullanıcı-adı')


                if ($page.data.user.role === 0) {
                    const searchUnitName = document.getElementById('input-unit-name').value
                    if (searchUnitName)
                        searchParams.set('birim-adı', searchUnitName)
                    else
                        searchParams.delete('birim-adı')
                }

                searchParams.delete('sayfa')

                _fetch(
                    `/api/user/get-users?${decodeURI(searchParams.toString())}`,
                    {method: 'GET'},
                    async (body) => {
                        if (body.users.length)
                            data.users = body.users
                        else
                            data.users = []

                        data.noMore = body.noMore

                        if (searchUserFullName)
                            $page.url.searchParams.set('kullanıcı-adı', searchUserFullName)
                        else
                            $page.url.searchParams.delete('kullanıcı-adı')

                        if ($page.data.user.role === 0) {
                            const searchUnitName = document.getElementById('input-unit-name').value
                            if (searchUnitName)
                                $page.url.searchParams.set('birim-adı', searchUnitName)
                            else
                                $page.url.searchParams.delete('birim-adı')
                        }

                        $page.url.searchParams.delete('sayfa')
                        _page = 1

                        window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                        goto(
                            `/kullanıcılar?${decodeURI($page.url.searchParams.toString())}`,
                            {
                                replaceState: true,
                                noScroll: true,
                                keepFocus: true,
                                invalidateAll: false
                            }
                        )
                    },
                    () => {
                        showErrorSnackbar('Bilinmeyen bir hata meydana geldi. Daha sonra tekrar deneyin.')
                    }
                )
            },
            500
        )
    }

    async function onAddNewUserClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalAddUser, addToBackstack: true})
    }

    async function onRemoveUserClick(event, user) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalRemoveUser, props: {user}})
    }

    function onSkeletonCreate(node) {
        for (const skeleton of node.querySelectorAll('.skeleton-user'))
            addIntersectionObserver(
                skeleton,
                async () => {
                    if (fetching)
                        return

                    fetching = true

                    const searchParams = new URLSearchParams($page.url.searchParams)
                    searchParams.set('sayfa', _page + 1)

                    _fetch(
                        `/api/user/get-users?${decodeURI(searchParams.toString())}`,
                        {method: 'GET'},
                        async (body) => {
                            if (body.users.length)
                                data.users = data.users.concat(body.users)

                            data.noMore = body.noMore

                            if (body.users.length) {
                                $page.url.searchParams.set('sayfa', ++_page)

                                window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                                await goto(
                                    `/kullanıcılar?${decodeURI($page.url.searchParams.toString())}`,
                                    {
                                        replaceState: true,
                                        noScroll: true,
                                        keepFocus: true,
                                        invalidateAll: false
                                    }
                                )
                            }

                            fetching = false
                        },
                        () => {
                            fetching = false
                        }
                    )
                },
            )
    }
</script>

<svelte:head>
    <title>Kullanıcılar | Personel Takip Sistemi, Adıyaman Üniversitesi</title>
</svelte:head>

<section class="max-w-page-small m-h-auto small-screen-p-b-page-fab" in:fly={TRANSITION_PAGE}>
    <div class="grid-input-filters grid grid-two-column-page-content m-b-3">
        {#if $page.data.user.role === 0}
            <InputText
                    inputClasses="input-text-search"
                    type="text"
                    title=""
                    placeholder="Birim adı"
                    name="input-unit-name"
                    enterKeyHint="done"
                    validate={() => {return true}}
                    value={$page.url.searchParams.get('birim-adı')}
                    tText="Aramak istediğiniz birimin adını yazın"
                    on:input={onFilter}
                    optional
                    noOptionalText
            />
        {/if}

        <InputText
                inputClasses="input-text-search"
                type="text"
                title=""
                placeholder="Kullanıcı adı"
                name="input-user-full-name"
                enterKeyHint="done"
                validate={() => {return true}}
                value={$page.url.searchParams.get('kullanıcı-adı')}
                tText="Aramak istediğiniz kullanıcının adını yazın"
                on:input={onFilter}
                optional
                noOptionalText
        />
    </div>

    <div class="p-r grid grid-two-column-page-content">
        {#each data.users as user (user.id)}
            <article class="p-r flex g-1dot5 p-d color-background-second b-r-d"
                     animate:flip={{ duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED, easing: cubicInOut }}
                     in:fly={TRANSITION_IN_USER}
                     out:fade={TRANSITION_OUT_USER}>

                <svg class="icon-user b-box"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 512 512">

                    <path d="M256 288A144 144 0 1 0 256 0a144 144 0 1 0 0 288zm-94.7 32C72.2 320 0 392.2 0 481.3c0 17 13.8 30.7 30.7 30.7l450.6 0c17 0 30.7-13.8 30.7-30.7C512 392.2 439.8 320 350.7 320l-189.4 0z"/>
                </svg>

                <div class="flex f-column g-dot25 o-hidden">
                    <p class="text-hint-3 m-l-dot-025 color-text-university f-w-700">
                        {@html user.role === 1 ? `<span class="color-text-accent">YÖNETİCİ, </span>` : ''} {user.authorizedUnit.name}
                    </p>

                    <p class="text-4 l-h-1-dot-25 text-max-one-line">{user.fullName}</p>
                </div>

                <article class="wrapper-option-icons p-a t-0 r-0 flex a-i-c color-background-third">
                    <button class="button-icon-option"
                            on:click={event => onRemoveUserClick(event, user)}>

                        <svg class="icon-option"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 448 512">
                            <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                        </svg>
                    </button>
                </article>
            </article>
        {:else}
            <div class="p-a w-100" in:fly={TRANSITION_PAGE}>
                <img id="image-not-found-search"
                     class="w-100 m-h-auto"
                     src="/not-found-search.svg"
                     alt="Kullanıcı Bulunamadı | Personel Takip Sistemi, Adıyaman Üniversitesi">

                <h3 class="h-3 h-3-m-b t-a-c">Kullanıcı Bulunamadı.</h3>

                <p class="text-3 t-a-c">Başka anahtar sözcüklerle arama <br> yapmaya ne dersiniz?</p>
            </div>
        {/each}

        {#if !data.noMore}
            <div use:onSkeletonCreate
                 class="d-contents">

                {#each new Array(6) as _}
                    <div class="skeleton-user loading-1 b-r-d"></div>
                {/each}
            </div>
        {/if}
    </div>

    <button on:click={onAddNewUserClick}>
        <svg class="fab b-box p-f b-r-c for-small-screen"
             in:fly={TRANSITION_FAB}
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 448 512">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
        </svg>
    </button>
</section>

<style>
    .icon-user {
        width: 2.5rem;
        min-width: 2.5rem;
        height: 2.5rem;
        min-height: 2.5rem;

        padding: .225rem;

        margin-top: -.25rem;
        margin-bottom: .125rem;


        fill: var(--color-university);
    }

    .wrapper-option-icons {
        border-top-right-radius: var(--border-radius);
        border-bottom-left-radius: calc(var(--border-radius) - .25rem);
    }

    .icon-option {
        height: 1.075rem;

        padding: .75rem;

        fill: var(--color-error)
    }

    @media (min-width: 65.001em) {
        .skeleton-user {
            height: 7.375rem;
        }
    }

    @media (max-width: 65em) {
        .skeleton-user {
            height: 6.375rem;
        }
    }


    @media (hover: hover) {
        .icon-option {
            transition: fill .25s ease-in-out;
        }

        .button-icon-option:hover .icon-option {
            fill: var(--color-error-darker);
        }
    }
</style>
<script>
    import {
        DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
        DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED,
        TRANSITION_CHANGEABLE_TEXT,
        TRANSITION_FAB,
        TRANSITION_PAGE
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {waitFor} from "$lib/js/common/util.common.js";
    import {onDestroy, onMount} from "svelte";
    import InputText from "$lib/components/InputText.svelte";
    import {page} from "$app/stores";
    import {fade, fly} from "svelte/transition";
    import {flip} from "svelte/animate";
    import {cubicInOut} from "svelte/easing";
    import {_fetch, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {openModal} from "$lib/js/client/util.modals.client.common.js";
    import ModalWorkDetails from "$lib/components/homepage/modals/ModalWorkDetails.svelte";
    import {validateDate} from "$lib/js/client/util.validations.client.common.js";
    import {goto, invalidate} from "$app/navigation";
    import {
        EVENT_URL_CHANGING,
        EVENT_WORK_ADDED,
        EVENT_WORK_EDITED,
        EVENT_WORK_REMOVED
    } from "$lib/js/client/events.client.js";
    import {addIntersectionObserver} from "$lib/js/client/util.observation.client.common.js";
    import {browser} from "$app/environment";
    import ModalRemoveWork from "$lib/components/homepage/modals/ModalRemoveWork.svelte";
    import ModalAddWork from "$lib/components/layout/modals/ModalAddWork.svelte";
    import ModalEditWork from "$lib/components/homepage/modals/ModalEditWork.svelte";

    export let data

    let _page = Number($page.url.searchParams.get('sayfa')) || 1,
        searchTimeout,
        fetching,
        validDate,
        removing,
        adding

    $: TRANSITION_OUT_WORK = (() => {
        if (removing)
            return {
                duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
                easing: cubicInOut
            }

        return {duration: 0}
    })()

    $: TRANSITION_IN_WORK = (() => {
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

    async function _onMount() {
        window.addEventListener(EVENT_WORK_REMOVED, onWorkRemoved)
        window.addEventListener(EVENT_WORK_ADDED, onWorkAdded)
        window.addEventListener(EVENT_WORK_EDITED, onWorkEdited)

        await waitFor(DURATION_TRANSITION_PROGRESS_BAR_NAVIGATED)

        switch (decodeURI(window.location.search)) {
            case '?oturum-açık':
                showErrorSnackbar('Oturumunuz zaten açık.')

                break
            case '?yetkisiz':
                showErrorSnackbar('Bu sayfayı görüntülemek için yetkiniz yok.')

                break
            case '?bilinmeyen-bir-hata-meydana-geldi':
                showErrorSnackbar('Bilinmeyen bir hata meydana geldi. Daha sonra tekrar deneyin.')

                break
        }
    }

    function _onDestroy() {
        window.removeEventListener(EVENT_WORK_REMOVED, onWorkRemoved)
        window.removeEventListener(EVENT_WORK_ADDED, onWorkAdded)
        window.removeEventListener(EVENT_WORK_EDITED, onWorkEdited)
    }

    async function onWorkRemoved() {
        removing = true

        await invalidate('app:çalışmalar')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Çalışma başarıyla silindi.')

        removing = false
    }

    async function onWorkAdded() {
        adding = true
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED * 2)
        adding = false
    }

    async function onWorkEdited() {
        await invalidate('app:çalışmalar')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Çalışma başarıyla düzenlendi.')
    }

    async function onArticleClick(event, work) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalWorkDetails, props: {work}})
    }

    async function onFilter() {
        clearTimeout(searchTimeout)

        searchTimeout = setTimeout(
            async () => {
                if (!validDate)
                    return

                const searchDate = document.getElementById('input-date').value,
                    searchParams = new URLSearchParams($page.url.searchParams)

                if (searchDate)
                    searchParams.set('tarih', searchDate)
                else
                    searchParams.delete('tarih')

                searchParams.delete('sayfa')

                _fetch(
                    `/api/work/get-self-works?${decodeURI(searchParams.toString())}`,
                    {method: 'GET'},
                    async (body) => {
                        if (body.works.length)
                            data.works = body.works
                        else
                            data.works = []

                        data.noMore = body.noMore

                        if (searchDate)
                            $page.url.searchParams.set('tarih', searchDate)
                        else
                            $page.url.searchParams.delete('tarih')

                        $page.url.searchParams.delete('sayfa')
                        _page = 1

                        window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                        goto(
                            `/?${decodeURI($page.url.searchParams.toString())}`,
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

    async function onAddWorkClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalAddWork})
    }

    async function onEditWorkClick(event, work) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalEditWork, props: {work}})
    }

    async function onRemoveWorkClick(event, id) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalRemoveWork, props: {id}})
    }

    function onSkeletonCreate(node) {
        for (const skeleton of node.querySelectorAll('.skeleton-work'))
            addIntersectionObserver(
                skeleton,
                async () => {
                    if (fetching)
                        return

                    fetching = true

                    const searchParams = new URLSearchParams($page.url.searchParams)
                    searchParams.set('sayfa', _page + 1)

                    _fetch(
                        `/api/work/get-self-works?${decodeURI(searchParams.toString())}`,
                        {method: 'GET'},
                        async (body) => {
                            if (body.works.length)
                                data.works = data.works.concat(body.works)

                            data.noMore = body.noMore

                            if (body.works.length) {
                                $page.url.searchParams.set('sayfa', ++_page)

                                window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                                await goto(
                                    `/?${decodeURI($page.url.searchParams.toString())}`,
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
    <title>Anasayfa | Personel Takip Sistemi, Adıyaman Üniversitesi</title>
</svelte:head>

<section class="max-w-page-small m-h-auto small-screen-p-b-page-fab" in:fly={TRANSITION_PAGE}>
    <div class="grid grid-two-column-page-content m-b-3">
        <InputText
                inputClasses="input-text-search"
                type="text"
                title=""
                placeholder="Tarih"
                name="input-date"
                enterKeyHint="done"
                validate={validateDate}
                value={$page.url.searchParams.get('tarih')}
                tText="Görüntülemek istediğiniz günü yazınız <br/> GG.AA.YYYY formatında olmalı"
                on:input={onFilter}
                bind:valid={validDate}
                optional
                noOptionalText
        />
    </div>

    <div class="p-r grid grid-two-column-page-content">
        {#each data.works as work (work.id)}
            <div class="p-r"
                 animate:flip={{ duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED, easing: cubicInOut }}
                 in:fly={TRANSITION_IN_WORK}
                 out:fade={TRANSITION_OUT_WORK}>

                <article class="wrapper-option-icons p-a t-0 r-0 flex a-i-c color-background-third">
                    <button class="button-icon-option"
                            on:click={event => onEditWorkClick(event, work)}>

                        <svg class="icon-option icon-option-first"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 512 512">
                            <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/>
                        </svg>
                    </button>

                    <button class="button-icon-option"
                            on:click={event => onRemoveWorkClick(event, work.id)}>

                        <svg class="icon-option icon-option-remove icon-option-negative icon-option-last"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 448 512">
                            <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                        </svg>
                    </button>
                </article>

                <article class="clickable-article flex f-column g-2 p-d color-background-second b-r-d pointer"
                         on:click={event => onArticleClick(event, work)}>

                    <div class="flex g-1dot5 a-i-e">
                        <svg class="icon-work b-box"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 448 512">

                            <path d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 48L0 160l0-48C0 85.5 21.5 64 48 64l48 0 0-32c0-17.7 14.3-32 32-32zM0 192l448 0 0 272c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 192zM329 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-95 95-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L329 305z"/>
                        </svg>

                        <div class="flex f-column g-dot25">
                            <p class="text-hint-3 m-l-dot-025 color-text-university f-w-700">
                                {@html [0, 1].includes(work.user.role) ? `<span class="color-text-accent">YÖNETİCİ, </span>` : ''} {work.unit.name}
                            </p>

                            <p class="text-4 l-h-1-dot-25">{work.user.name}</p>
                        </div>
                    </div>

                    {#key work.content}
                        <p class="text-4 l-h-1-dot-25 text-max-two-lines t-a-j"
                           in:fly={TRANSITION_CHANGEABLE_TEXT}>{work.content}</p>
                    {/key}

                    <p id="text-date" class="text-hint-3 color-text-accent f-w-700 m-l-auto">{work.date}</p>
                </article>
            </div>
        {:else}
            <div class="p-a w-100" in:fly={TRANSITION_PAGE}>
                <img id="image-not-found-search"
                     class="w-100 m-h-auto"
                     src="/not-found-search.svg"
                     alt="Birim Bulunamadı | Personel Takip Sistemi, Adıyaman Üniversitesi">

                <h3 class="h-3 h-3-m-b t-a-c">Birim Bulunamadı.</h3>

                <p class="text-3 t-a-c">Başka anahtar sözcüklerle arama <br> yapmaya ne dersiniz?</p>
            </div>
        {/each}

        {#if !data.noMore}
            <div use:onSkeletonCreate class="d-contents">
                {#each new Array(6) as _}
                    <div class="skeleton-work loading-1 b-r-d"></div>
                {/each}
            </div>
        {/if}
    </div>

    <button on:click={onAddWorkClick}>
        <svg class="fab b-box p-f b-r-c for-small-screen"
             in:fly={TRANSITION_FAB}
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 448 512">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
        </svg>
    </button>
</section>

<style>
    .icon-work {
        width: 2.5rem;
        min-width: 2.5rem;
        height: 2.5rem;
        min-height: 2.5rem;

        padding-block: .1rem;

        margin-left: -.15rem;
        margin-top: -.2rem;

        fill: var(--color-university);
    }

    .wrapper-option-icons {
        border-top-right-radius: var(--border-radius);
        border-bottom-left-radius: calc(var(--border-radius) - .25rem);

        padding-block: .75rem;
    }

    .icon-option {
        height: 1.15rem;

        fill: var(--color-university);
    }

    .icon-option-first {
        padding-left: 1.1rem;
        padding-right: .425rem;
    }

    .icon-option-last {
        padding-left: .425rem;
        padding-right: 1.1rem;
    }

    .icon-option-negative {
        fill: var(--color-error)
    }

    .icon-option-remove {
        height: 1.075rem;
    }

    .text-max-two-lines {
        height: calc(1.25rem * 2);
    }

    #text-date {
        margin-top: .125rem;
    }

    @media (min-width: 65.001em) {
        .skeleton-work {
            height: 14.675rem;
        }
    }

    @media (max-width: 65em) {
        .skeleton-work {
            height: 13.6757rem;
        }
    }

    @media (hover: hover) {
        .icon-option {
            transition: fill .25s ease-in-out;
        }

        .clickable-article {
            transition: background-color .25s ease-in-out;
        }

        .button-icon-option:hover .icon-option {
            fill: var(--color-university-darker);
        }

        .button-icon-option:hover .icon-option-negative {
            fill: var(--color-error-darker);
        }

        .clickable-article:hover {
            background-color: var(--color-background-third) !important;
        }
    }
</style>

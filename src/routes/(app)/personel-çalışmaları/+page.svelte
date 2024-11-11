<script>
    import {
        DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
        TRANSITION_CHANGEABLE_TEXT,
        TRANSITION_PAGE
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {showErrorSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import InputText from "$lib/components/InputText.svelte";
    import {page} from "$app/stores";
    import {fly} from "svelte/transition";
    import {flip} from "svelte/animate";
    import {cubicInOut} from "svelte/easing";
    import {_fetch, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {openModal} from "$lib/js/client/util.modals.client.common.js";
    import ModalWorkDetails from "$lib/components/homepage/modals/ModalWorkDetails.svelte";
    import {validateDate} from "$lib/js/client/util.validations.client.common.js";
    import {goto} from "$app/navigation";
    import {EVENT_URL_CHANGING} from "$lib/js/client/events.client.js";
    import {addIntersectionObserver} from "$lib/js/client/util.observation.client.common.js";

    export let data

    let _page = Number($page.url.searchParams.get('sayfa')) || 1,
        searchTimeout,
        fetching,
        validDate

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

                const searchUserFullName = document.getElementById('input-user-full-name').value,
                    searchDate = document.getElementById('input-date').value,
                    searchParams = new URLSearchParams($page.url.searchParams)

                if ($page.data.user.role === 0) {
                    const searchUnitName = document.getElementById('input-unit-name').value
                    if (searchUnitName)
                        searchParams.set('birim-adı', searchUnitName)
                    else
                        searchParams.delete('birim-adı')
                }

                if (searchUserFullName)
                    searchParams.set('kullanıcı-adı', searchUserFullName)
                else
                    searchParams.delete('kullanıcı-adı')

                if (searchDate)
                    searchParams.set('tarih', searchDate)
                else
                    searchParams.delete('tarih')

                searchParams.delete('sayfa')

                _fetch(
                    `/api/work/get-staff-works?${decodeURI(searchParams.toString())}`,
                    {method: 'GET'},
                    async (body) => {
                        if (body.works.length)
                            data.works = body.works
                        else
                            data.works = []

                        data.noMore = body.noMore

                        if ($page.data.user.role === 0) {
                            const searchUnitName = document.getElementById('input-unit-name').value
                            if (searchUnitName)
                                $page.url.searchParams.set('birim-adı', searchUnitName)
                            else
                                $page.url.searchParams.delete('birim-adı')
                        }

                        if (searchUserFullName)
                            $page.url.searchParams.set('kullanıcı-adı', searchUserFullName)
                        else
                            $page.url.searchParams.delete('kullanıcı-adı')

                        if (searchDate)
                            $page.url.searchParams.set('tarih', searchDate)
                        else
                            $page.url.searchParams.delete('tarih')

                        $page.url.searchParams.delete('sayfa')
                        _page = 1

                        window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                        goto(
                            `/personel-çalışmaları?${decodeURI($page.url.searchParams.toString())}`,
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
                        `/api/work/get-staff-works?${decodeURI(searchParams.toString())}`,
                        {method: 'GET'},
                        async (body) => {
                            if (body.works.length)
                                data.works = data.works.concat(body.works)

                            data.noMore = body.noMore

                            if (body.works.length) {
                                $page.url.searchParams.set('sayfa', ++_page)

                                window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                                await goto(
                                    `/personel-çalışmaları?${decodeURI($page.url.searchParams.toString())}`,
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
    <title>Personel Çalışmaları | Personel Takip Sistemi, Adıyaman Üniversitesi</title>
</svelte:head>

<section class="max-w-page-small m-h-auto" in:fly={TRANSITION_PAGE}>
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
                 in:fly={{...TRANSITION_PAGE,duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED}}>

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
        .clickable-article {
            transition: background-color .25s ease-in-out;
        }

        .clickable-article:hover {
            background-color: var(--color-background-third) !important;
        }
    }
</style>

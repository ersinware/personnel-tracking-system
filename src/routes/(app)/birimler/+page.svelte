<script>
    import {
        DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
        TRANSITION_CHANGEABLE_TEXT,
        TRANSITION_FAB,
        TRANSITION_PAGE
    } from "$lib/js/client/constants.transitions.client.common.js";
    import {fade, fly} from "svelte/transition";
    import {_fetch, performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {openModal} from "$lib/js/client/util.modals.client.common.js";
    import ModalRemoveUnit from "$lib/components/units/modals/ModalRemoveUnit.svelte";
    import {onDestroy, onMount} from "svelte";
    import {browser} from "$app/environment";
    import {
        EVENT_UNIT_ADDED,
        EVENT_UNIT_EDITED,
        EVENT_UNIT_REMOVED,
        EVENT_URL_CHANGING
    } from "$lib/js/client/events.client.js";
    import {showErrorSnackbar, showPositiveSnackbar} from "$lib/js/client/util.snackbars.client.common.js";
    import {cubicInOut} from "svelte/easing";
    import {flip} from "svelte/animate";
    import {waitFor} from "$lib/js/common/util.common.js";
    import ModalAddUnit from "$lib/components/layout/modals/ModalAddUnit.svelte";
    import ModalEditUnit from "$lib/components/units/modals/ModalEditUnit.svelte";
    import {page} from "$app/stores";
    import InputText from "$lib/components/InputText.svelte";
    import {goto, invalidate} from "$app/navigation";
    import {addIntersectionObserver} from "$lib/js/client/util.observation.client.common.js";

    export let data

    let _page = Number($page.url.searchParams.get('sayfa')) || 1,
        searchTimeout,
        fetching,
        removing,
        adding

    $: TRANSITION_OUT_UNIT = (() => {
        if (removing)
            return {
                duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED,
                easing: cubicInOut
            }

        return {duration: 0}
    })()

    $: TRANSITION_IN_UNIT = (() => {
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
        window.addEventListener(EVENT_UNIT_ADDED, onUnitAdded)
        window.addEventListener(EVENT_UNIT_REMOVED, onUnitRemoved)
        window.addEventListener(EVENT_UNIT_EDITED, onUnitEdited)
    }

    function _onDestroy() {
        window.removeEventListener(EVENT_UNIT_ADDED, onUnitAdded)
        window.removeEventListener(EVENT_UNIT_REMOVED, onUnitRemoved)
        window.removeEventListener(EVENT_UNIT_EDITED, onUnitEdited)
    }

    async function onUnitRemoved() {
        removing = true

        await invalidate('app:birimler')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Birim başarıyla silindi.')

        removing = false
    }

    async function onUnitEdited() {
        await invalidate('app:birimler')
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED)

        showPositiveSnackbar('Birim başarıyla düzenlendi.')
    }

    async function onUnitAdded() {
        adding = true
        await waitFor(DURATION_TRANSITION_AFTER_CONTENT_CHANGED * 2)
        adding = false
    }

    async function onFilter() {
        clearTimeout(searchTimeout)

        searchTimeout = setTimeout(
            async () => {
                const search = document.getElementById('input-unit-name').value,
                    searchParams = new URLSearchParams($page.url.searchParams)

                if (search)
                    searchParams.set('arama', search)
                else
                    searchParams.delete('arama')

                searchParams.delete('sayfa')

                _fetch(
                    `/api/unit/get-units?${decodeURI(searchParams.toString())}`,
                    {method: 'GET'},
                    async (body) => {
                        if (body.units.length)
                            data.units = body.units
                        else
                            data.units = []

                        data.noMore = body.noMore

                        if (search)
                            $page.url.searchParams.set('arama', search)
                        else
                            $page.url.searchParams.delete('arama')

                        $page.url.searchParams.delete('sayfa')
                        _page = 1

                        window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                        goto(
                            `/birimler?${decodeURI($page.url.searchParams.toString())}`,
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

    function getCountNumber(unit) {
        return unit.countNumber ? unit.countNumber + ' ÇALIŞMA' : '<span class="color-text-error">0 ÇALIŞMA</span>'
    }

    async function onAddUnitClick(event) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalAddUnit})
    }

    async function onEditUnitClick(event, unit) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalEditUnit, props: {unit}})
    }

    async function onRemoveUnitClick(event, unit) {
        await performRippleEffectAndWait(event)

        openModal({component: ModalRemoveUnit, props: {unitId: unit.id, unitName: unit.name}})
    }

    function onSkeletonCreate(node) {
        for (const skeleton of node.querySelectorAll('.skeleton-unit'))
            addIntersectionObserver(
                skeleton,
                async () => {
                    if (fetching)
                        return

                    fetching = true

                    const searchParams = new URLSearchParams($page.url.searchParams)
                    searchParams.set('sayfa', _page + 1)

                    _fetch(
                        `/api/unit/get-units?${decodeURI(searchParams.toString())}`,
                        {method: 'GET'},
                        async (body) => {
                            if (body.units.length)
                                data.units = data.units.concat(body.units)

                            data.noMore = body.noMore

                            if (body.units.length) {
                                $page.url.searchParams.set('sayfa', ++_page)

                                window.dispatchEvent(new CustomEvent(EVENT_URL_CHANGING))
                                await goto(
                                    `/birimler?${decodeURI($page.url.searchParams.toString())}`,
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
    <title>Birimler | Personel Takip Sistemi, Adıyaman Üniversitesi</title>
</svelte:head>

<section class="max-w-page-small m-h-auto small-screen-p-b-page-fab" in:fly={TRANSITION_PAGE}>
    <div class="grid grid-two-column-page-content m-b-3">
        <InputText
                inputClasses="input-text-search"
                type="text"
                title=""
                placeholder="Birim adı"
                name="input-unit-name"
                enterKeyHint="done"
                validate={() => {return true}}
                value={$page.url.searchParams.get('arama')}
                tText="Aramak istediğiniz birimin adını yazın"
                on:input={onFilter}
                optional
                noOptionalText
        />
    </div>

    <div class="p-r grid grid-two-column-page-content">
        {#each data.units as unit (unit.id)}
            <article class="p-r flex g-1dot5 p-d color-background-second b-r-d"
                     animate:flip={{ duration: DURATION_TRANSITION_AFTER_CONTENT_CHANGED, easing: cubicInOut }}
                     in:fly={TRANSITION_IN_UNIT}
                     out:fade={TRANSITION_OUT_UNIT}>

                <svg class="icon-unit"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 576 512">
                    <path d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z"/>
                </svg>

                <div class="flex f-column g-dot25">
                    <p class="text-hint-3 m-l-dot-025 color-text-university f-w-700">{@html getCountNumber(unit)}</p>

                    {#key unit.name}
                        <p class="text-4 l-h-1-dot-25" in:fly={TRANSITION_CHANGEABLE_TEXT}>{unit.name}</p>
                    {/key}
                </div>

                <article class="wrapper-option-icons p-a t-0 r-0 flex a-i-c color-background-third">
                    <button class="button-icon-option"
                            on:click={event => onEditUnitClick(event, unit)}>

                        <svg class="icon-option icon-option-first"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 512 512">
                            <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/>
                        </svg>
                    </button>

                    <button class="button-icon-option"
                            on:click={event => onRemoveUnitClick(event, unit)}>

                        <svg class="icon-option icon-option-remove icon-option-negative icon-option-last"
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
                     alt="Birim Bulunamadı | Personel Takip Sistemi, Adıyaman Üniversitesi">

                <h3 class="h-3 h-3-m-b t-a-c">Birim Bulunamadı.</h3>

                <p class="text-3 t-a-c">Başka anahtar sözcüklerle arama <br> yapmaya ne dersiniz?</p>
            </div>
        {/each}

        {#if !data.noMore}
            <div use:onSkeletonCreate
                 class="d-contents">

                {#each new Array(6) as _}
                    <div class="skeleton-unit loading-1 b-r-d"></div>
                {/each}
            </div>
        {/if}
    </div>

    <button on:click={onAddUnitClick}>
        <svg class="fab b-box p-f b-r-c for-small-screen"
             in:fly={TRANSITION_FAB}
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 448 512">
            <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
        </svg>
    </button>
</section>

<style>
    .icon-unit {
        width: 2.5rem;
        min-width: 2.5rem;
        height: 2.5rem;
        min-height: 2.5rem;

        margin-top: -.125rem;

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

    @media (min-width: 65.001em) {
        .skeleton-unit {
            height: 7.375rem;
        }
    }

    @media (max-width: 65em) {
        .skeleton-unit {
            height: 6.375rem;
        }
    }

    @media (hover: hover) {
        .icon-option {
            transition: fill .25s ease-in-out;
        }

        .button-icon-option:hover .icon-option {
            fill: var(--color-university-darker);
        }

        .button-icon-option:hover .icon-option-negative {
            fill: var(--color-error-darker);
        }
    }
</style>
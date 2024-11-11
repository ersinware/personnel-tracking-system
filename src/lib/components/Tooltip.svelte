<script>
    import {browser} from '$app/environment'
    import {getStore} from '$lib/js/client/util.client.common'
    import {
        onMountHoverable,
        onMountHoverableReverse,
        removeOnHoverable,
        removeOnHoverableReverse
    } from '$lib/js/client/util.responsive.client.common'
    import {onDestroy, onMount} from 'svelte'
    import {cubicInOut} from 'svelte/easing'
    import {fly} from 'svelte/transition'
    import {randomID} from "$lib/js/common/util.common.js";
    import {DURATION_TRANSITION_TOOLTIP} from "$lib/js/client/constants.transitions.client.common.js";

    export let wrapperStyle,
        classes,
        tooltipStyle,
        tooltipClasses,
        text,
        visible,
        bottom,
        left,
        manual,
        dontCloseOnHover

    let wrapper

    const id = randomID(),
        hoverable = getStore('hoverable'),
        touchable = getStore('touchable'),
        transition = left ? {x: '.25rem', easing: cubicInOut, duration: DURATION_TRANSITION_TOOLTIP} : {y: bottom ? '.25rem' : '-.25rem', easing: cubicInOut, duration: DURATION_TRANSITION_TOOLTIP}

    onMount(_onMount)

    if (browser)
        onDestroy(_onDestroy)

    function _onMount() {
        if (manual)
            return

        onMountHoverable({
            id,
            onMount: () => {
                wrapper.addEventListener('mouseenter', onMouseEnter)
                wrapper.addEventListener('mouseleave', onMouseLeave)
            }
        })

        onMountHoverableReverse({
            id,
            reverse: () => {
                wrapper.removeEventListener('mouseenter', onMouseEnter)
                wrapper.removeEventListener('mouseleave', onMouseLeave)
            }
        })
    }

    function _onDestroy() {
        removeOnHoverable(id)
        removeOnHoverableReverse(id)

        if (!wrapper)
            return

        wrapper.removeEventListener('mouseenter', onMouseEnter)
        wrapper.removeEventListener('mouseleave', onMouseLeave)
    }

    function onTooltipCreate(tooltip) {
        if ($hoverable)
            tooltip.addEventListener('mouseenter', onTooltipMouseEnter)

        if ($touchable)
            tooltip.addEventListener('touchstart', onTouchStart)
    }

    function onMouseEnter() {
        if (manual)
            return

        visible = true
    }

    function onMouseLeave() {
        if (manual)
            return

        visible = false
    }

    function onTooltipMouseEnter() {
        if (manual && dontCloseOnHover !== undefined && !dontCloseOnHover)
            visible = false
    }

    function onTouchStart(event) {
        visible = false

        event.preventDefault()
        event.stopPropagation()
    }
</script>

<div style={wrapperStyle ?? ''}
     class="wrapper-tooltip p-r {classes ?? ''}"
     bind:this={wrapper}>

    <slot/>

    {#if visible}
        <article style={tooltipStyle ?? ''}
                 class="tooltip l-h-1 p-a t-a-c f-w-600 {tooltipClasses ?? ''}"
                 class:bottom
                 class:left
                 use:onTooltipCreate
                 transition:fly={transition}>

            {@html text}
        </article>
    {/if}
</div>

<style>
    .wrapper-tooltip {
        display: var(--tooltip-display, block);
    }

    .tooltip {
        top: calc(var(--tooltip-distance, var(--default-tooltip-distance)) * -1);
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -100%);
        z-index: 98;

        max-width: var(--tooltip-max-width, unset);
        width: var(--tooltip-width, unset);
        line-height: 0.725rem;

        padding: 0.5rem 1rem 0.5rem;

        color: var(--color-text-tooltip, white) !important;
        background-color: var(--background-color-tooltip, var(--color-background-tooltip-default)) !important;

        font-family: Poppins, sans-serif;
        font-size: 0.675rem;

        white-space: var(--tooltip-white-space, unset);

        border-radius: calc(var(--border-radius) - 0.25rem);

        transition: color 0.25s ease-in-out,
        background-color 0.25s ease-in-out;
    }

    .tooltip:after {
        content: '';

        position: absolute;
        top: calc(100% - 1px);
        left: 50%;
        z-index: 988;

        margin-left: -0.6rem;
        border-width: 0.6rem;
        border-style: solid;
        border-color: var(--background-color-tooltip, var(--color-background-tooltip-default)) transparent transparent transparent !important;

        transition: border 0.25s ease-in-out;
    }

    .bottom {
        top: unset;
        bottom: calc(var(--tooltip-distance, 1rem) * -1);
        transform: translate(-50%, 100%);
    }

    .bottom:after {
        top: unset;
        bottom: calc(100% - 1px);
        border-color: transparent transparent var(--background-color-tooltip, var(--color-background-tooltip-default)) transparent !important;
    }

    .left {
        top: 50%;
        transform: translateY(-50%);
        left: var(--tooltip-distance);
    }

    .left:after {
        top: 50%;
        left: revert;
        right: calc(100% - 1px);
        transform: translateY(-50%);

        margin-left: revert;

        border-width: 0.475rem;

        border-color: transparent var(--background-color-tooltip, var(--color-background-tooltip-default)) transparent transparent !important;
    }

    @media (min-width: 65.001em) {
        .wrapper-tooltip {
            --default-tooltip-distance: 1.25rem;
        }
    }

    @media (max-width: 65em) {
        .wrapper-tooltip {
            --default-tooltip-distance: 1.25rem;
        }

        .tooltip {
            padding-top: 0.6rem;
            padding-bottom: calc(0.5rem + 1px);
        }
    }
</style>

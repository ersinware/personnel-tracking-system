<script>
    import {createEventDispatcher} from 'svelte'
    import {performRippleEffectAndWait, yieldToMain} from "$lib/js/client/util.client.common.js";

    export let id,
        checked,
        disabled

    const dispatch = createEventDispatcher()

    async function onClick(event) {
        event.preventDefault()
        await performRippleEffectAndWait(event)
        checked = !checked

        await yieldToMain()
        dispatch('click', event)
    }
</script>

<label for={id} class="switch p-r flex a-i-c" on:click={onClick}>
    <input {id} {disabled} type="checkbox" bind:checked class="p-a w-h-100 pointer"/>

    <div class="cylinder p-none w-100 b-r-d"/>

    <div class="ball p-none p-a flex a-i-c j-c-c">
        <div class="hover-circle p-none p-a"/>
    </div>
</label>

<style>
    .switch {
        min-width: 2.3rem;
        width: 2.3rem;
        height: 1.25rem;
    }

    input {
        opacity: 0;
    }

    .cylinder {
        height: 0.8rem;

        transition: 0.25s background-color ease-in-out;

        background-color: var(--color-background-fifth);
    }

    .ball {
        transform: translateX(0);

        width: 1.3rem;
        height: 1.3rem;

        background-color: var(--color-university) !important;

        transition: 0.25s background-color ease-in-out,
        transform 0.25s ease-in-out;
    }

    .ball,
    .hover-circle {
        border-radius: 50%;
    }

    .hover-circle {
        width: 2.5rem;
        height: 2.5rem;

        transition: background-color 0.25s ease-in-out;
    }

    input:checked ~ .ball {
        transform: translateX(1.1rem);
    }

    input:enabled:checked ~ .cylinder {
        background-color: rgba(70, 130, 180, 0.5) !important;
    }

    input:disabled {
        pointer-events: none;
    }

    input:disabled ~ .ball {
        background-color: var(--color-text-unimportant) !important;
    }

    @media (hover: hover) {
        input:hover:enabled ~ .ball > .hover-circle {
            background-color: rgba(0, 0, 0, .05) !important;
        }

        input:hover:enabled:checked ~ .ball > .hover-circle {
            background-color: rgba(70, 130, 180, 0.125) !important;
        }
    }
</style>

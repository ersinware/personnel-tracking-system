<script>
    import {performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {closeLastModal} from "$lib/js/client/util.modals.client.common.js";

    export let work

    async function onCloseClick(event) {
        await performRippleEffectAndWait(event)

        closeLastModal()
    }
</script>

<article class="wrapper-modal-content flex f-column a-i-c g-v-d-modal big-screen-max-w-modal-content-small">
    <article class="flex f-column g-2 w-100">
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

        <p class="text-4 l-h-1-dot-25 t-a-j">{work.content}</p>

        <p id="text-date" class="text-hint-3 color-text-accent f-w-700 m-l-auto">{work.date}</p>
    </article>

    <article class="wrapper-option-icons p-a t-0 r-0 flex a-i-c color-background-third">
        <button class="button-icon-option"
                on:click={onCloseClick}>

            <svg class="icon-option"
                 xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 384 512">
                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
            </svg>
        </button>
    </article>
</article>

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

    #text-date {
        margin-top: .125rem;
    }

    .wrapper-option-icons {
        border-top-right-radius: var(--border-radius);
        border-bottom-left-radius: calc(var(--border-radius) - .25rem);
    }

    .icon-option {
        height: 1rem;

        padding-block: .75rem;
        padding-right: 1rem;
        padding-left: .9rem;

        fill: var(--color-error)
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
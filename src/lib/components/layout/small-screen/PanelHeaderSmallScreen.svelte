<script>
    import {fly} from "svelte/transition";
    import {TRANSITION_PAGE} from "$lib/js/client/constants.transitions.client.common.js";
    import {performRippleEffectAndWait} from "$lib/js/client/util.client.common.js";
    import {openLeftMenu} from "$lib/js/client/left.menu.small.screen.client.js";

    async function onMenuClick(event) {
        await performRippleEffectAndWait(event)

        openLeftMenu()
    }
</script>

<div id="wrapper-header" class="b-box p-f t-0 l-0 w-100 p-h-d for-small-screen">
    <header id="header" class="flex j-c-s-b a-i-c w-h-100" in:fly={TRANSITION_PAGE}>
        <button on:click={onMenuClick}>
            <svg id="icon-menu"
                 viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">

                <path d="M4 6H20M4 12H14M4 18H9"
                      stroke="var(--color-icon-menu)"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                />
            </svg>
        </button>
    </header>
</div>

<style>
    @media (max-width: 65em) {
        #wrapper-header {
            z-index: 100;

            backdrop-filter: blur(1rem);
        }

        #wrapper-header,
        #header {
            height: var(--height-header);
        }

        #header {
            background-color: transparent;

            border-bottom: .1px solid var(--color-divider);
        }

        #icon-menu {
            --color-icon-menu: var(--color-university);

            height: 2.5rem;
        }

        @media (hover: hover) {
            #icon-menu:hover {
                --color-icon-menu: var(--color-university-darker)
            }
        }
    }
</style>
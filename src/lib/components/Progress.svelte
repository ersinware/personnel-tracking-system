<script>
    export let state, forModal

    let navigating, navigated, hide, navigatingTimeout, navigatedTimeout

    $: onChange(state)

    function onChange() {
        if (state === 'navigating') onNavigating()
        else if (state === 'navigated') onNavigated()
    }

    function onNavigating() {
        clearTimeout(navigatingTimeout)

        if (navigating || navigated) {
            hide = true
            navigating = false
            navigated = false
        }

        navigatingTimeout = setTimeout(() => {
            navigated = false
            hide = false
            navigating = true
        }, 50)
    }

    function onNavigated() {
        clearTimeout(navigatingTimeout)
        clearTimeout(navigatedTimeout)

        navigated = true
        hide = false
        navigating = false

        navigatedTimeout = setTimeout(
            () => {
                hide = true
                navigated = false
                navigating = false
            },
            !forModal ? 750 : 375
        )
    }
</script>

<article
        class="wrapper t-0"
        class:p-f={!forModal}
        class:p-a={forModal}
        class:navigating
        class:navigated
        class:hide
        class:forModal
/>

<style>
    .wrapper {
        z-index: 100;

        left: 0;

        width: 0;
        height: 0.25rem;

        background-color: var(--color-accent);
    }

    .wrapper:not(.forModal) {
        border-top-right-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
    }

    .forModal {
        left: 50%;
        transform: translateX(-50%);

        border-radius: var(--border-radius);
    }

    .navigating {
        transition: width 10s;
        width: 75%;
    }

    .navigated {
        transition: width .75s;
        width: 100%;
    }

    .hide {
        opacity: 0;
    }

    .forModal.navigating {
        transition: width 10s;
    }

    .forModal.navigated {
        transition: width 0.375s;
    }
</style>

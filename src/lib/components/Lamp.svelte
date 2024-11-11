<script>
    import { onLampClick } from '$lib/js/client/util.lamp.client.common'
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article id="lamp" class="lamp p-none w-h-100 p-f l-0 t-0" on:click={onLampClick} />

<style>
    .lamp {
        z-index: 100;

		background: rgba(0, 0, 0, .5);

        opacity: 0;

        transition: opacity 0.5s;

        backdrop-filter: blur(.5rem);
    }
</style>

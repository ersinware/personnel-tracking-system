<script>
    import InputText from "$lib/components/InputText.svelte";
    import {areEqualStrings} from "$lib/js/client/util.inputs.client.common.js";
    import {performRippleEffectAndWait, yieldToMain} from "$lib/js/client/util.client.common.js";

    export let _units, value, valid, disable

    let units = _units,
        command

    function validate() {
        for (const unit of _units)
            if (areEqualStrings(unit.name, value))
                return true

        return false
    }

    async function onFocus() {
        if (!value || value.trim().length === 0)
            units = _units
    }

    function onInput() {
        units = _units.filter(unit => unit.name.toLowerCase().includes(value.toLowerCase()))
    }

    async function onBlur() {
        units = _units.filter(unit => unit.name.toLowerCase().includes(value.toLowerCase()))
    }

    function isSelectedUnit(unitName) {
        return areEqualStrings(unitName, value)
    }

    async function onUnitClick(event, unitName) {
        await performRippleEffectAndWait(event)

        value = unitName
        units = _units.filter(unit => unit.name.toLowerCase().includes(value.toLowerCase()))
        command = {type: 'checkValidation', blur: true}

        await yieldToMain()

        command = undefined
    }
</script>

<InputText
        inputClasses="t-a-l t-capitalize"
        type="text"
        name="input-project-unit-modal"
        title=""
        placeholder="Birim adı"
        tText="Sistemdeki birimlerden biri olmalı"
        {validate}
        bind:value
        bind:valid
        bind:disable
        bind:command
        on:focus={onFocus}
        on:input={onInput}
        on:blur={onBlur}
/>

<div id="wrapper-modal-search-box-results-input-project-unit-panel"
     class="b-box w-100 color-background-second b-r-d o-y-scroll"
     class:wrapper-search-box-results-no-result="{!units.length}">

    {#each units as unit, index}
        {@const selectedUnit = isSelectedUnit(unit.name, value)}

        <button disabled={disable}
                type="button"
                class="button-search-box-search-result text-5 w-100 t-a-l l-h-1"
                class:button-search-box-search-result-active={selectedUnit}
                class:button-nude-disabled={disable}
                on:click={event => onUnitClick(event, unit.name)}
                on:mousedown|preventDefault>

            {unit.name}
        </button>

        {#if selectedUnit}
            <input type="hidden" id="input-unit-id" value={unit.id}>
        {/if}

        {#if index !== units.length - 1}
            <div class="h-divider"></div>
        {/if}
    {:else}
        <p class="flex a-i-c j-c-c text-5 m-b-v-d-over-4 t-a-c">Birim <br> Bulunamadı</p>
    {/each}
</div>

<style>
    #wrapper-modal-search-box-results-input-project-unit-panel {
        height: 14.75rem;

        padding-block: 1rem;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
</style>


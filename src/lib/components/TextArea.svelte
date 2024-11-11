<script>
    import Tooltip from "$lib/components/Tooltip.svelte";
    import {onMount} from "svelte";
    import {areEqualStrings} from "$lib/js/client/util.inputs.client.common.js";

    export let wrapperStyle,
        wrapperClasses,
        inputClasses,
        inputStyle,
        name,
        title,
        value,
        tText,
        validate,
        format,
        valid,
        disable,
        optional,
        validInVisual,
        enterKeyHint,
        rows,
        placeholder;

    let input,
        focus,
        exitedOnce,
        tVisible,
        editMode,
        firstValue,
        empty = !value;

    if (value) {
        editMode = true;
        firstValue = value;
        validInVisual = true;
        valid = "notEdited";
    }

    if (optional || disable) valid = true;

    onMount(_onMount);

    function _onMount() {
        if (!disable && input === document.activeElement) focus = true;
    }

    async function onFocus(event) {
        event.target.setSelectionRange(
            event.target.value.length,
            event.target.value.length,
        );
        focus = true;
        tVisible = true;
    }

    function onBeforeInput(event) {
        if (!format || !event.data) return;

        const formatted = format(event.target.value + event.data, event.data);
        if (!formatted) return;

        const newValue = formatted.newValue;
        if (newValue) {
            event.target.value = newValue;
            event.preventDefault();

            return;
        }

        if (formatted.preventDefault) event.preventDefault();
    }

    function onInput(event) {
        const newValue = event.target.value;
        if (!newValue) {
            empty = true;

            if (optional) {
                valid = true;
                validInVisual = undefined;
                tVisible = exitedOnce = false;

                return;
            }
        } else empty = false;

        const validation = validate(newValue, name);

        if (editMode && areEqualStrings(newValue, firstValue))
            valid = "notEdited";
        else valid = validation;

        tVisible = !validation;

        if (exitedOnce) validInVisual = validation;
    }

    function onBlur(event) {
        focus = false;

        if (optional && !event.target.value) {
            tVisible = false;

            return;
        }

        if (exitedOnce) {
            tVisible = !validInVisual;

            return;
        }

        exitedOnce = true;

        if (validate(event.target.value, name)) {
            markValidInVisual();

            return;
        }

        markInvalidInVisual();
    }

    function markValidInVisual() {
        validInVisual = true;
        tVisible = false;
    }

    function markInvalidInVisual() {
        validInVisual = false;
        tVisible = true;
    }
</script>

<Tooltip --background-color-tooltip={validInVisual === false ? 'var(--color-error)' : ''}
         --tooltip-text-color={validInVisual === false ? 'white' : ''}
         style={wrapperStyle ?? ""}
         classes={wrapperClasses}
         text={tText}
         bind:visible={tVisible}
         bind:dontCloseOnHover={validInVisual}
         manual>

    <div class="p-r">
        <textarea
                id={name}
                {name}
                value={value ?? ""}
                disabled={disable}
                enterkeyhint={enterKeyHint ?? "next"}
                {rows}
                style={inputStyle ?? ""}
                class="input-text b-box text-4 w-100 l-h-1-dot-25 t-a-c b-r-d t-a-j {inputClasses ?? ''}"
                class:focus
                class:empty
                class:valid={validInVisual}
                class:invalid={validInVisual === false}
                class:disabled={disable}
                bind:this={input}
                on:focus={onFocus}
                on:beforeinput={onBeforeInput}
                on:input={onInput}
                on:blur={onBlur}
                {placeholder}
        />

        <label class="input-label text-hint-2 p-none p-a f-w-800 b-r-d nowrap" for={name}>
            {title}{optional ? " - TERCİHEN" : ""}
        </label>
    </div>
</Tooltip>
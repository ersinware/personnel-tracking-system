<script>
    import Tooltip from '$lib/components/Tooltip.svelte'
    import {createEventDispatcher, onMount} from 'svelte'
    import {areEqualStrings} from "$lib/js/client/util.inputs.client.common.js";

    export let wrapperClasses,
        inputClasses,
        name,
        type,
        inputmode,
        title,
        value,
        tText,
        validate,
        format,
        valid,
        command,
        disable,
        optional,
        input,
        validInVisual,
        enterKeyHint,
        placeholder,
        noOptionalText

    let focus,
        exitedOnce,
        tVisible,
        editMode,
        firstValue,
        empty = !value && value !== 0

    const dispatchEvent = createEventDispatcher()

    $: onCommand(command)

    onMount(_onMount)

    if (value || value === 0) {
        editMode = true
        firstValue = value
        validInVisual = true
        valid = 'notEdited'
    }

    if (optional || disable) valid = true

    function onCommand() {
        if (!command)
            return

        switch (command.type) {
            case 'checkValidation':
                if (command.ifExitedOnce && !exitedOnce)
                    return

                const validation = validate(value)
                if (editMode && areEqualStrings(value, firstValue))
                    valid = 'notEdited'
                else
                    valid = validation

                tVisible = !validation
                validInVisual = validation
                empty = !value && value !== 0

                if (command.blur)
                    input.blur()

                break
        }

        command = undefined
    }

    function _onMount() {
        if (input === document.activeElement) focus = true
    }

    async function onFocus(event) {
        dispatchEvent('focus')

        if (type !== 'email' && type !== 'number')
            event.target.setSelectionRange(event.target.value.length, event.target.value.length)

        focus = true
        tVisible = true
    }

    function onBeforeInput(event) {
        if (!format || !event.data) return

        const formatted = format(event.target.value + event.data, event.data)
        if (!formatted) return

        const newValue = formatted.newValue
        if (newValue) {
            event.target.value = newValue
            event.preventDefault()

            return
        }

        if (formatted.preventDefault)
            event.preventDefault()
    }

    function onInput(event) {
        setTimeout(
            () => {
                dispatchEvent('input')
            },
            0
        )

        const newValue = (value = event.target.value)

        if (!newValue) {
            empty = true

            if (optional) {
                valid = true
                validInVisual = undefined
                tVisible = exitedOnce = false

                return
            }
        } else
            empty = false

        const validation = validate(newValue, name)

        if (editMode && areEqualStrings(newValue, firstValue))
            valid = 'notEdited'
        else
            valid = validation

        tVisible = !validation

        if (exitedOnce)
            validInVisual = validation
    }

    function onBlur(event) {
        dispatchEvent('blur')

        focus = false

        if (optional && !event.target.value) {
            tVisible = false

            return
        }

        if (exitedOnce) {
            tVisible = !validInVisual

            return
        }

        exitedOnce = true

        if (validate(event.target.value, name)) {
            markValidInVisual()

            return
        }

        markInvalidInVisual()
    }

    function markValidInVisual() {
        validInVisual = true
        tVisible = false
    }

    function markInvalidInVisual() {
        validInVisual = false
        tVisible = true
    }
</script>

<Tooltip
        --background-color-tooltip={validInVisual === false ? 'var(--color-error)' : ''}
        --tooltip-text-color={validInVisual === false ? 'white' : ''}
        classes={wrapperClasses}
        text={tText}
        bind:visible={tVisible}
        bind:dontCloseOnHover={validInVisual}
        manual>

    <div class="p-r">
        <input
                id={name}
                {name}
                {type}
                {inputmode}
                value={value ?? ''}
                disabled={disable}
                enterkeyhint={enterKeyHint ?? 'next'}
                class="input-text b-box text-4 w-100 l-h-1 t-a-c b-r-d {inputClasses ?? ''}"
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
                on:click
                placeholder={placeholder ? (placeholder + ((optional && !noOptionalText) ? ' - Tercihen': '')) : undefined}
        />

        <label class="input-label text-hint-2 p-none p-a f-w-800 b-r-d nowrap" for={name}>
            {title}{title && optional && !noOptionalText ? ' - TERCİHEN' : ''}
        </label>
    </div>
</Tooltip>
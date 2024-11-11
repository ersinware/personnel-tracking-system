export function addIntersectionObserver(node, onVisible, onInvisible, threshold) {
    const observer = new IntersectionObserver(
        entries => onIntersectionChange(entries, onVisible, onInvisible),
        { threshold: threshold ?? 0 }
    )

    observer.observe(node)

    return observer
}

function onIntersectionChange(entries, onVisible, onInvisible) {
    for (const entry of entries)
        if (entry.isIntersecting) {
            onVisible()

            return
        }

    if (onInvisible)
        onInvisible()
}
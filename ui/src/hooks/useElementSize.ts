import { useEffect, useState } from "react"

export const useElementSize = () => {
    const [elementRef, setElementRef] = useState<HTMLElement | null>(null)
    const [elementSize, setElementSize] = useState<ResizeObserverSize>({ blockSize: 0, inlineSize: 0 })

    useEffect(() => {
        if (!elementRef) return;

        const observer = new ResizeObserver(([record]) => {
            setElementSize(record.borderBoxSize[0])
        })

        observer.observe(elementRef, {
            box: 'border-box'
        })

        const { width, height } = elementRef.getBoundingClientRect()
        setElementSize({
            blockSize: height,
            inlineSize: width
        })

        return () => observer.disconnect()
    }, [elementRef])

    return {
        setElementRef,
        elementSize
    }
}
import { useElementSize } from '../hooks/useElementSize'
import styles from './ActionFooter.module.css'

/**
 * TODO: documentar
 */
export default function ActionFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    const { elementSize, setElementRef } = useElementSize()

    const placeholderStyles: Record<string, string> = {
        '--el-height': `${elementSize.blockSize}px`
    }

    return (
        <>
            <div className={`${styles['idk']}`} ref={setElementRef}>
                <div className={className}>
                    {children}
                </div>
            </div>
            <div className={`${styles["placeholder"]}`} style={placeholderStyles} aria-hidden></div>
        </>
    )
}

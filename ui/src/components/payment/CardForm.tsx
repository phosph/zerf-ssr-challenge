import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import styles from './CardForm.module.css'

export interface ICarfFormRef {
    shift4GroupObject: Shift4ComponentGroupObject | null
}

export default (function CardForm({ shift4Obj, ref }: { shift4Obj: Shift4Object, ref?: Ref<ICarfFormRef | null> }) {

    const [groupObj, setGroupObj] = useState<Shift4ComponentGroupObject | null>(null)
    
    useImperativeHandle(ref, (): ICarfFormRef => ({
        shift4GroupObject: groupObj
    }), [groupObj])


    const formRef = useRef<HTMLFieldSetElement | null>(null)

    useEffect(() => {
        if (shift4Obj && formRef.current) {
            setGroupObj(shift4Obj.createComponentGroup().automount(formRef.current))
        }
    }, [shift4Obj])

    return (
        <fieldset ref={formRef} className="grid grid-cols-2 gap-y-6 gap-x-3">
            <div className={`col-span-2 ${styles["form-control-wrapper"]}`}>
                <label className={styles["control-label"]}>
                    Card number
                </label>
                <div data-shift4="number" className={styles["form-control"]}></div>
            </div>
            <div className={styles["form-control-wrapper"]}>
                <label className={styles["control-label"]}>
                    Expiration Date
                </label>
                <div data-shift4="expiry" className={styles["form-control"]}></div>
            </div>
            <div className={styles["form-control-wrapper"]}>
                <label className={styles["control-label"]}>
                    Security code
                </label>
                <div data-shift4="cvc" className={styles["form-control"]}></div>
            </div>

            <div className={`col-span-2 ${styles["form-control-wrapper"]}`}>
                <label className={styles["control-label"]}>
                    Security code
                </label>

                <Select name="country">
                    <SelectTrigger className="w-full border-[#BDC5CB] px-3.5 py-2.5 !h-auto text-base">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* TODO */}
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </fieldset>
    )
})
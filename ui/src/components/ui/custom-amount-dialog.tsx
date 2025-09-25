import { useState, type FormEvent } from "react"
import { Button } from "./button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { currencyFromNaturalNumber } from "common/currency-utils.js"

export function CustomAmountDialog({ children, onSubmit, currentValue }: { children: React.ReactNode, onSubmit: (amount: number) => void, currentValue?: number | null }) {
    const [value, setValue] = useState<string>(() => currentValue ? (currentValue / 100).toFixed() : '')

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const val = currencyFromNaturalNumber(Number(value))
        // TODO: validate
        onSubmit(val)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-80 w-[90vw]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Custom Tip</DialogTitle>
                        <DialogDescription>
                            Feel free to enter any amount you think is fair. Your support means a lot!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 mb-6">
                        <div className="form-control-wrapper">
                            <label className="control-label">amount</label>
                            <input className="form-control" value={value} onChange={(e) => setValue(e.target.value)} type="number" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="submit" variant="default">Apply</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}

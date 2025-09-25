import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleCheck } from "lucide-react";

export function SuccessPaymentDialog() {
    return (
        <section>
            <DialogHeader>
                <CircleCheck size={40} className="text-[#198F51] mx-auto mb-2" />
                <DialogTitle>Success Payment</DialogTitle>
            </DialogHeader>
        </section>
    )
}

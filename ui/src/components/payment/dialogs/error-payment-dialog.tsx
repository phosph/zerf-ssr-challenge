import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleX } from "lucide-react";

export function ErrorPaymentDialog() {
    return (
        <section>
            <DialogHeader>
                <CircleX size={40} className="text-[#FF7262] mx-auto mb-2" />
                <DialogTitle>Error Payment</DialogTitle>
            </DialogHeader>
        </section>
    )
}

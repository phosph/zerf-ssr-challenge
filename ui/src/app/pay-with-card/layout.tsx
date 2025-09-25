'use client'

import { getShift4PublicKey } from "@/lib/getShift4PublicKey";
import Script from "next/script";
import { useEffect, useState } from "react";
import { Shift4Context } from "./Shift4Context";



export default function PayWithCardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [loaded, setLoaded] = useState<boolean>(false)
    const [shift4Obj, setShift4Obj] = useState<Shift4Object | null>(null)

    useEffect(() => {
        if (loaded) {
            const obj = globalThis.Shift4(getShift4PublicKey())
            setShift4Obj(obj)
        }
    }, [loaded])

    return (
        <Shift4Context.Provider value={shift4Obj}>
            {children}
            <Script src='https://js.dev.shift4.com/shift4.js' onReady={() => setLoaded(true)} onError={console.error} />
        </Shift4Context.Provider>
    )
}

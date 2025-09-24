"use client"

import { useEffect, useState } from "react"

export let useApplePayAvailability: () => boolean

const isHttps = globalThis.location?.protocol === 'https:'

if (isHttps && 'ApplePaySession' in globalThis) {
    useApplePayAvailability = () => {
        // TODO: get from ENV
        const merchantIdentifier = ""

        const [availability, setAvailability] = useState(false)

        useEffect(() => {
            let mayUpdate = true;

            ; (
                ApplePaySession.applePayCapabilities?.(merchantIdentifier).then(({ paymentCredentialStatus }) => paymentCredentialStatus !== "applePayUnsupported")
                ?? ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier)
            ).then((canMakePayments) => {
                if (mayUpdate) setAvailability(canMakePayments)
            })

            return () => { mayUpdate = false }
        }, [])

        return availability
    }
} else {
    useApplePayAvailability = () => false;
}

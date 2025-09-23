/* eslint-disable @typescript-eslint/no-explicit-any */
declare function Shift4(publicKey: string): Shift4Object

type ComponentType = "card" | "number" | "expiry" | "cvc" | "expiryMonth" | "expiryYear"


interface Shift4ComponentObject {
    mount(selector: string): Shift4ComponentObject
    clear(): Shift4ComponentObject
}

interface Shift4ComponentGroupObject {
    automount(selector: string | Element): Shift4ComponentGroupObject
    createComponent(types: ComponentType, options: Record<string, any>): Shift4ComponentObject
}


interface Shift4Object {
    createComponent(types: ComponentType, options: Record<string, any>): Shift4ComponentObject
    createComponentGroup(): Shift4ComponentGroupObject
    createToken(component: Shift4ComponentObject | Shift4ComponentGroupObject, data?: Record<string, any>): Promise<IShift4Token>
}

interface IShift4Token {
    id: string;
    created: number; // timestamp
    objectType; "token"
    used: boolean;
    livemode: boolean;
}

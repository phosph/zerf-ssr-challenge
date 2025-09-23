export interface IPerformPaymentBody {
    country: string;
    amount: number;
}

interface IPerformPaymentBodyComplete extends IPerformPaymentBody {
    tokenId: string;
}

export const tipPayment = (body: IPerformPaymentBodyComplete) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/tip/payment`, {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    })
}


export class TipPaymentSession {
    constructor(
        private shift4Object: Shift4Object,
        private shift4ComponentGroupObject: Shift4ComponentGroupObject
    ) { }


    #token: IShift4Token | null = null

    async createToken() {
        this.#token = await this.shift4Object.createToken(this.shift4ComponentGroupObject)
    }

    async tipPayment(data: IPerformPaymentBody) {

        if (!this.#token) {
            await this.createToken();
        }

        const parsed: IPerformPaymentBodyComplete = { ...data, tokenId: '' }

        parsed["tokenId"] = this.#token!.id

        return tipPayment(parsed)
    }

    static of(shift4Object: Shift4Object, shift4ComponentGroupObject: Shift4ComponentGroupObject) {
        return new TipPaymentSession(shift4Object, shift4ComponentGroupObject);
    }
}
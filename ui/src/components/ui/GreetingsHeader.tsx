import Image from 'next/image'

export interface IGreetingsHeaderProps {
    days: number
}

/** @deprecated reemplazar por versión inline */
export default function GreetingsHeader({ days }: IGreetingsHeaderProps) {
    return (
        <header className="flex flex-col gap-2.5 items-center px-4 pt-2">
            <Image src="/hotel-logo.svg" alt="hotel logo" width={20} height={35} />
            {/* TODO: parametrizar la cantidad de días */}
            <p className='text-center font-light text-neutral-600'>Dear Guest,<br /> Thank you for spending <span className="font-medium">{days} days</span> with us!</p>
        </header>
    )
}
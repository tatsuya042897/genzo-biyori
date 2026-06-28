import Image from 'next/image'

type Props = {
  size?: number
  className?: string
}

export default function Logo({ size = 48, className = '' }: Props) {
  return (
    <Image
      src="/icons/icon-192x192.png"
      alt="現像日和"
      width={size}
      height={size}
      className={`rounded-xl ${className}`}
      priority
    />
  )
}

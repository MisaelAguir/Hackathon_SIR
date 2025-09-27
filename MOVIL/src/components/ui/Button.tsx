
import React from 'react'
import { clsx } from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid'|'outline'|'ghost'
  size?: 'sm'|'md'|'lg'
}
export default function Button({ className, variant='solid', size='md', ...props }: Props){
  const base = 'inline-flex items-center justify-center rounded-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-0'
  const sizes = { sm:'px-3 py-1.5 text-sm', md:'px-4 py-2', lg:'px-5 py-3 text-lg' }[size]
  const variants = {
    solid: 'bg-[var(--riaar-orange)] hover:bg-orange-500 text-white',
    outline: 'border border-white/20 hover:bg-white/10',
    ghost: 'hover:bg-white/10'
  }[variant]
  return <button className={clsx(base,sizes,variants,className)} {...props} />
}

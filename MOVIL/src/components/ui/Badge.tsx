
import React from 'react'
import { clsx } from 'clsx'
export default function Badge({className='', ...props}: React.HTMLAttributes<HTMLSpanElement>){
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-semibold bg-[var(--riaar-orange)]/20 text-[var(--riaar-yellow)]', className)} {...props} />
}

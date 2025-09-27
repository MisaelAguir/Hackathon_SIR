
import React from 'react'
import { clsx } from 'clsx'
export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={clsx('w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--riaar-yellow)]', props.className)} />
}

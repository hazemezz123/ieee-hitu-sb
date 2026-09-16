'use client'

import { useState } from 'react'

export function initialsOf(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function MemberCard({ member }) {
  const [failed, setFailed] = useState(false)
  const showImg = Boolean(member.img) && !failed
  const title = [member.position, member.committee].filter(Boolean).join(', ')

  return (
    <li className="card flex flex-col items-center p-6 text-center">
      {showImg ? (
        <img
          src={member.img}
          alt={`${member.name} photo`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-fixed text-xl font-black text-on-primary-fixed"
        >
          {initialsOf(member.name)}
        </span>
      )}
      <p className="mt-4 font-medium text-on-surface">{member.name}</p>
      <p className="mt-1 text-sm text-on-surface-variant">{title}</p>
    </li>
  )
}

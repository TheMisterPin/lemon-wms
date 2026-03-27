import React from 'react'

export function Footer() {
  return (
    <footer className="border-t bg-linear-to-l from-gray-700 to-slate-500">
      <div className="container flex h-14 items-center justify-center text-sm text-neutral-200 ">
        <p>&copy; {new Date().getFullYear()} BoxMas. All rights reserved.</p>
      </div>
    </footer>
  )
}

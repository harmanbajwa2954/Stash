import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'

const Header = () => {
  return (
    <div className='fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b'>
      <nav className='container mx-auto px-4 py-4 flex items-center justify-between gap-4'>
        <Link href="/">
          <Image src={"/logofull.png"}
            alt='Stash Logo'
            height={60}
            width={200}
            className='h-12 w-auto object-contain' />
        </Link>

        <div className='flex items-center space-x-4'>
          <SignedIn>
            <Link href={"/dashboard"} className='text-gray-800 hover:text-blue-600 flex items-center gap-2' >
            <Button variant="outline">
              <LayoutDashboard size={18} />
              <span className='hidden md:inline'>Dashboard</span>
            </Button>
            </Link>

            <Link href={"/transactions/create"}>
            <Button  className="flex items-center gap-2">
              <PenBox size={18} />
              <span className='hidden md:inline'>Transactions</span>
            </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl=''>
              <Button variant="outline" className={'cursor-pointer hover:bg-gray-200'}>Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton appearance={{
              elements : {
                avatarBox: "w-20 h-20",
              },
            }} />
          </SignedIn>
        </div>
      </nav>

    </div>
  )
}

export default Header

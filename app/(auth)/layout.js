import React from 'react'

const AuthLayout = ({children}) => {
  return (
    <div className='flex justify-center pt-40 items-center overflow-hidden'>
      {children}
    </div>
  )
}

export default AuthLayout;
'use client'
import React from 'react'
import { GoogleSignInForm } from '../../../app/(auth)/sign-in/google-signin-form'
import { FacebookSignInForm } from './facebook-signin-form'

const SocialAuth = () => {
  return (
    <div className='flex justify-center'>
      <GoogleSignInForm />
      <FacebookSignInForm />
    </div>
  )
}

export default SocialAuth
'use server'

import twilio from 'twilio'
import User from '@/lib/db/models/user.model'
import { connectToDatabase } from '@/lib/db'
import { auth } from '@/auth'
import { formatError } from '@/lib/utils'

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured')
  }
  return twilio(accountSid, authToken)
}

/**
 * Validates and formats a Mexican phone number to E.164 format (+52XXXXXXXXXX).
 * Only accepts exactly 10 digits.
 */
function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) {
    throw new Error('El número de teléfono debe tener exactamente 10 dígitos')
  }
  return `+52${digits}`
}

/**
 * Sends an SMS verification code using Twilio Verify.
 * No need to store OTPs manually — Twilio handles it.
 */
export async function sendPhoneVerificationSMS(phone: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    const formattedPhone = formatPhoneE164(phone)

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    if (!serviceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID not configured')
    }

    console.log('Sending SMS verification:', {
      serviceSid: `${serviceSid.slice(0, 5)}...`,
      accountSid: `${accountSid?.slice(0, 5)}...`,
      phone: formattedPhone.slice(0, 6) + '...'
    })

    const client = getTwilioClient()

    await client.verify.v2.services(serviceSid).verifications.create({
      to: formattedPhone,
      channel: 'sms',
    })

    return {
      success: true,
      message: 'Código SMS enviado correctamente',
      formattedPhone,
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return { success: false, error: formatError(error) }
  }
}

/**
 * Verifies the OTP code using Twilio Verify and saves the phone to the user profile.
 */
export async function verifyPhoneOTP(phone: string, code: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    const formattedPhone = formatPhoneE164(phone)

    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID
    if (!serviceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID not configured')
    }

    const client = getTwilioClient()

    const verification = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code: code.trim(),
      })

    if (verification.status !== 'approved') {
      return { success: false, error: 'Código incorrecto o expirado. Intenta de nuevo.' }
    }

    // Save verified phone to user profile
    await connectToDatabase()
    const user = await User.findById(session.user.id)
    if (user) {
      user.phone = formattedPhone
      user.phoneVerified = true
      await user.save()
    }

    return {
      success: true,
      message: 'Teléfono verificado correctamente.',
      phone: formattedPhone,
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: formatError(error) }
  }
}

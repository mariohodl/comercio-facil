'use server';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import VerificationEmail from '@/emails/verification-email';
import { connectToDatabase } from '../db';
import VerificationToken from '../db/models/verification-token.model';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(email: string, userName?: string) {
    try {
        await connectToDatabase();

        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Create token in database (expires in 10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Delete any existing tokens for this email
        await VerificationToken.deleteMany({ email });

        // Create new token
        await VerificationToken.create({
            email,
            token: verificationCode,
            expiresAt,
        });

        // Check if we're in development or using testing domain
        const isDev = process.env.NODE_ENV === 'development';
        const isTestingDomain = process.env.EMAIL_FROM?.includes('resend.dev') || !process.env.EMAIL_FROM;



        // Try to send email via Resend
        try {
            const { data, error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'Comercio Fácil <onboarding@resend.dev>',
                to: email,
                subject: 'Verifica tu cuenta - Comercio Fácil',
                react: VerificationEmail({ verificationCode, userName }),
            });

            if (error) {
                console.error('Resend API Error:', error);

                // If using testing domain, still return success since code is in console
                if (error.message?.includes('Testing domain') || error.message?.includes('can only send')) {

                    return {
                        success: true,
                        message: 'Verification code created (check server console)',
                        devMode: true
                    };
                }

                return { success: false, error: 'Failed to send verification email' };
            }

            return { success: true, message: 'Verification email sent successfully' };
        } catch (emailError) {
            console.error('Error sending email:', emailError);

            // In development or testing domain, still return success
            if (isDev || isTestingDomain) {

                return {
                    success: true,
                    message: 'Verification code created (check server console)',
                    devMode: true
                };
            }

            return { success: false, error: 'Failed to send verification email' };
        }
    } catch (error) {
        console.error('Error in sendVerificationEmail:', error);
        return { success: false, error: 'Failed to send verification email' };
    }
}

/**
 * Verify the code provided by user
 */
export async function verifyEmailCode(email: string, code: string) {
    try {
        await connectToDatabase();

        // Find valid token
        const token = await VerificationToken.findOne({
            email,
            token: code,
            expiresAt: { $gt: new Date() },
        });

        if (!token) {
            return { success: false, error: 'Invalid or expired verification code' };
        }

        // Delete the used token
        await VerificationToken.deleteOne({ _id: token._id });

        return { success: true, message: 'Email verified successfully' };
    } catch (error) {
        console.error('Error in verifyEmailCode:', error);
        return { success: false, error: 'Failed to verify code' };
    }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(email: string, userName?: string) {
    return await sendVerificationEmail(email, userName);
}

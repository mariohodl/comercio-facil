'use server';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import VerificationEmail from '@/emails/verification-email';
import PasswordResetEmail from '@/emails/password-reset-email';
import { connectToDatabase } from '../db';
import VerificationToken from '../db/models/verification-token.model';
import PasswordResetToken from '../db/models/password-reset-token.model';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

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

        // Create token in database (expires in 24 hours)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, userName?: string) {
    try {
        await connectToDatabase();

        // Generate token
        const token = uuidv4();

        // Expire in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Delete existing tokens
        await PasswordResetToken.deleteMany({ email });

        // Save new token
        await PasswordResetToken.create({
            email,
            token,
            expiresAt,
        });

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const isDev = process.env.NODE_ENV === 'development';
        const isTestingDomain = process.env.EMAIL_FROM?.includes('resend.dev') || !process.env.EMAIL_FROM;

        try {
            const { error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'Comercio Fácil <onboarding@resend.dev>',
                to: email,
                subject: 'Restablece tu contraseña - Comercio Fácil',
                react: PasswordResetEmail({ resetLink, userName }),
            });

            if (error) {
                console.error('Resend API Error:', error);
                if (error.message?.includes('Testing domain') || error.message?.includes('can only send')) {
                    console.log('RESET LINK:', resetLink);
                    return {
                        success: true,
                        message: 'Reset link created (check server console)',
                        devMode: true
                    };
                }
                return { success: false, error: 'Failed to send reset email' };
            }

            return { success: true, message: 'Reset email sent successfully' };
        } catch (emailError) {
            console.error('Error sending reset email:', emailError);
            if (isDev || isTestingDomain) {
                console.log('RESET LINK:', resetLink);
                return {
                    success: true,
                    message: 'Reset link created (check server console)',
                    devMode: true
                };
            }
            return { success: false, error: 'Failed to send reset email' };
        }
    } catch (error) {
        console.error('Error in sendPasswordResetEmail:', error);
        return { success: false, error: 'Internal server error' };
    }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(email: string, userName?: string) {
    return await sendVerificationEmail(email, userName);
}

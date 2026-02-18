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


function generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
}


export async function sendVerificationEmail(email: string, userName?: string) {
    try {
        await connectToDatabase();

        const verificationCode = generateVerificationCode();

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await VerificationToken.deleteMany({ email });

        await VerificationToken.create({
            email,
            token: verificationCode,
            expiresAt,
        });

        const isDev = process.env.NODE_ENV === 'development';
        const isTestingDomain = process.env.EMAIL_FROM?.includes('resend.dev') || !process.env.EMAIL_FROM;

        if (process.env.SKIP_EMAILS === 'true') {
            console.log(`[SKIP_EMAILS] Skipping verification email to ${email}. Code: ${verificationCode}`);
            return {
                success: true,
                message: 'Verification code created (SKIP_EMAILS mode)',
                devMode: true
            };
        }

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


export async function verifyEmailCode(email: string, code: string) {
    try {
        await connectToDatabase();

        const token = await VerificationToken.findOne({
            email,
            token: code,
            expiresAt: { $gt: new Date() },
        });

        if (!token) {
            return { success: false, error: 'Invalid or expired verification code' };
        }

        await VerificationToken.deleteOne({ _id: token._id });

        return { success: true, message: 'Email verified successfully' };
    } catch (error) {
        console.error('Error in verifyEmailCode:', error);
        return { success: false, error: 'Failed to verify code' };
    }
}


export async function sendPasswordResetEmail(email: string, userName?: string) {
    try {
        await connectToDatabase();

        const token = uuidv4();

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await PasswordResetToken.deleteMany({ email });

        await PasswordResetToken.create({
            email,
            token,
            expiresAt,
        });

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const isDev = process.env.NODE_ENV === 'development';
        const isTestingDomain = process.env.EMAIL_FROM?.includes('resend.dev') || !process.env.EMAIL_FROM;

        if (process.env.SKIP_EMAILS === 'true') {
            console.log(`[SKIP_EMAILS] Skipping password reset email to ${email}. Link: ${resetLink}`);
            return {
                success: true,
                message: 'Reset link created (SKIP_EMAILS mode)',
                devMode: true
            };
        }

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

export async function resendVerificationCode(email: string, userName?: string) {
    return await sendVerificationEmail(email, userName);
}

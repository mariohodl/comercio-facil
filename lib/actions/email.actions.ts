'use server';
import { connectToDatabase } from '../db';
import User from '../db/models/user.model';
import { verifyEmailCode as verifyCode } from '../email/verification';

/**
 * Verify email and update user status
 */
export async function verifyUserEmail(email: string, code: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    shouldRedirect: string | null;
}> {
    try {
        // First verify the code
        const codeResult = await verifyCode(email, code);

        if (!codeResult.success) {
            return {
                ...codeResult,
                shouldRedirect: null
            };
        }

        // Connect to database
        await connectToDatabase();

        // Find and update the user
        const user = await User.findOne({ email, isDeleted: { $ne: true } });

        if (!user) {
            return {
                success: false,
                error: 'User not found. Please sign up again.',
                shouldRedirect: '/sign-up'
            };
        }

        // Update emailVerified status
        user.emailVerified = true;
        await user.save();

        return {
            success: true,
            message: 'Email verified successfully',
            shouldRedirect: '/admin/setup'
        };
    } catch (error) {
        console.error('Error in verifyUserEmail:', error);
        return {
            success: false,
            error: 'Failed to verify email. Please try again.',
            shouldRedirect: null
        };
    }
}

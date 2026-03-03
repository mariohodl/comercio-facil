import { test, expect } from '@playwright/test';
import { UserSignInSchema, UserSignUpSchema } from '@/lib/validator';

test.describe('Auth Validation Schemas', () => {

    test.describe('UserSignInSchema', () => {
        test('should validate valid email and password', () => {
            const result = UserSignInSchema.safeParse({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(result.success).toBe(true);
        });

        test('should fail with invalid email', () => {
            const result = UserSignInSchema.safeParse({
                email: 'invalid-email',
                password: 'password123'
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('El correo electrónico no es válido');
            }
        });

        test('should fail with short password', () => {
            const result = UserSignInSchema.safeParse({
                email: 'test@example.com',
                password: 'ab'
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 3 caracteres');
            }
        });
    });

    test.describe('UserSignUpSchema', () => {
        test('should validate matching passwords', () => {
            const result = UserSignUpSchema.safeParse({
                name: 'Test User',
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123',
                confirmPassword: 'password123',
            });
            expect(result.success).toBe(true);
        });

        test('should fail when passwords do not match', () => {
            const result = UserSignUpSchema.safeParse({
                name: 'Test User',
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123',
                confirmPassword: 'different-password',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                // The refinement error is usually attached to the path specified
                const error = result.error.issues.find(issue => issue.path.includes('confirmPassword'));
                expect(error).toBeDefined();
                expect(error?.message).toBe("Las contraseñas no coinciden");
            }
        });

        test('should require name', () => {
            const result = UserSignUpSchema.safeParse({
                name: 'A', // Too short (min 2)
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123',
                confirmPassword: 'password123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('El nombre de usuario debe tener al menos 2 caracteres');
            }
        });

        test('should fail if name is too long', () => {
            const result = UserSignUpSchema.safeParse({
                name: 'a'.repeat(51),
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123',
                confirmPassword: 'password123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('El nombre de usuario debe tener como máximo 50 caracteres');
            }
        });

        test('should require phone number', () => {
            const result = UserSignUpSchema.safeParse({
                name: 'Test User',
                email: 'test@example.com',
                phone: '', // Empty
                password: 'password123',
                confirmPassword: 'password123',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('El teléfono es obligatorio');
            }
        });
    });
});

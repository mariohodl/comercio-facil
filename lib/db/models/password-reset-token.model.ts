import { Document, Model, model, models, Schema } from 'mongoose';

export interface IPasswordResetToken extends Document {
    email: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
    {
        email: { type: String, required: true },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);

// Index to automatically delete expired tokens
// Valid for 1 hour
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken =
    (models.PasswordResetToken as Model<IPasswordResetToken>) ||
    model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;

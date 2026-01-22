import { Document, Model, model, models, Schema } from 'mongoose';

export interface IVerificationToken extends Document {
    email: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>(
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
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VerificationToken =
    (models.VerificationToken as Model<IVerificationToken>) ||
    model<IVerificationToken>('VerificationToken', verificationTokenSchema);

export default VerificationToken;

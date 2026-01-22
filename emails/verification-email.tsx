import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
    verificationCode: string;
    userName?: string;
}

export const VerificationEmail = ({
    verificationCode,
    userName = 'Usuario',
}: VerificationEmailProps) => (
    <Html>
        <Head />
        <Preview>Verifica tu cuenta - Comercio Fácil</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Heading style={h1}>Comercio Fácil</Heading>
                </Section>
                <Section style={content}>
                    <Heading style={h2}>¡Hola {userName}!</Heading>
                    <Text style={text}>
                        Gracias por registrarte en Comercio Fácil. Para completar tu registro,
                        por favor verifica tu correo electrónico usando el siguiente código:
                    </Text>
                    <Section style={codeContainer}>
                        <Text style={code}>{verificationCode}</Text>
                    </Section>
                    <Text style={text}>
                        Este código expirará en <strong>10 minutos</strong>.
                    </Text>
                    <Text style={text}>
                        Si no solicitaste esta verificación, puedes ignorar este correo.
                    </Text>
                </Section>
                <Section style={footer}>
                    <Text style={footerText}>
                        © 2026 Comercio Fácil. Todos los derechos reservados.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default VerificationEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const header = {
    backgroundColor: '#0f172a',
    padding: '24px',
    textAlign: 'center' as const,
};

const h1 = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0',
    padding: '0',
};

const content = {
    padding: '0 48px',
};

const h2 = {
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0 20px',
};

const text = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
};

const codeContainer = {
    background: '#f4f4f5',
    borderRadius: '8px',
    margin: '32px 0',
    padding: '24px',
    textAlign: 'center' as const,
};

const code = {
    color: '#0f172a',
    fontSize: '36px',
    fontWeight: 'bold',
    letterSpacing: '8px',
    margin: '0',
    fontFamily: 'monospace',
};

const footer = {
    padding: '0 48px',
    marginTop: '32px',
};

const footerText = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
};

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

interface PasswordResetEmailProps {
    resetLink: string;
    userName?: string;
}

export const PasswordResetEmail = ({
    resetLink,
    userName = 'Usuario',
}: PasswordResetEmailProps) => (
    <Html>
        <Head />
        <Preview>Restablece tu contraseña - Comercio Fácil</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Heading style={h1}>Comercio Fácil</Heading>
                </Section>
                <Section style={content}>
                    <Heading style={h2}>¡Hola {userName}!</Heading>
                    <Text style={text}>
                        Has solicitado restablecer tu contraseña en Comercio Fácil.
                        Haz clic en el siguiente botón para elegir una nueva contraseña:
                    </Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={resetLink}>
                            Restablecer contraseña
                        </Button>
                    </Section>
                    <Text style={text}>
                        Este enlace expirará en <strong>1 hora</strong> por motivos de seguridad.
                    </Text>
                    <Text style={text}>
                        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                        Tu contraseña actual no cambiará hasta que accedas al enlace y crees una nueva.
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

export default PasswordResetEmail;

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

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#f97316',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
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

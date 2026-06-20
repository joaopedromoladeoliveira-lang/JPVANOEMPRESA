import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@jpvano.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

export const sendVerificationEmail = async (email: string, token: string, username: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bem-vindo ao JPvano, ${username}!</h2>
      <p>Obrigado por se registrar. Para completar seu cadastro, clique no link abaixo:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verificar E-mail
      </a>
      <p>Ou copie e cole este link em seu navegador:</p>
      <p>${verificationUrl}</p>
      <p>Este link expira em 24 horas.</p>
      <hr />
      <p>Se você não se registrou, ignore este e-mail.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Verificação de E-mail - JPvano',
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string, username: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Redefinir Senha - JPvano</h2>
      <p>Olá ${username},</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Redefinir Senha
      </a>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Redefinição de Senha - JPvano',
    html,
  });
};

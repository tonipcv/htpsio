import { createTransport } from 'nodemailer';

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
  throw new Error('Missing SMTP configuration environment variables');
}

export const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Port 2525 is not secure by default
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

// Verificar a conexão antes de exportar
transporter.verify((error, success) => {
  if (error) {
    console.error('Erro na configuração do SMTP:', error);
  } else {
    console.log('Servidor SMTP está pronto para enviar emails');
  }
});

interface SendPatientConfirmationEmailParams {
  to: string;
  patientName: string;
  doctorName: string;
  accessLink: string;
}

export async function sendPatientConfirmationEmail({
  to,
  patientName,
  doctorName,
  accessLink
}: SendPatientConfirmationEmailParams) {
  await transporter.verify();
  console.log('SMTP connection verified');

  await transporter.sendMail({
    from: {
      name: 'MED1',
      address: process.env.SMTP_FROM as string
    },
    to,
    subject: 'Acesso à sua área do paciente',
    html: `
      <h1>Olá ${patientName}!</h1>
      <p>Você solicitou acesso à sua área do paciente. Clique no link abaixo para acessar:</p>
      <a href="${accessLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
        Acessar minha área
      </a>
      <p>Se você não solicitou este acesso, ignore este email.</p>
      <p>Este link é válido por 24 horas.</p>
    `
  });
  console.log('Email sent successfully');
}

export async function sendWelcomeEmail(
  patientName: string,
  patientEmail: string,
  temporaryPassword: string,
  doctorName: string
) {
  const emailContent = `
    <h1>Bem-vindo(a) ao Portal do Paciente</h1>
    <p>Olá ${patientName},</p>
    <p>Seu médico ${doctorName} criou um acesso para você no portal do paciente.</p>
    <p>Para acessar, use as seguintes credenciais:</p>
    <ul>
      <li>Email: ${patientEmail}</li>
      <li>Senha temporária: ${temporaryPassword}</li>
    </ul>
    <p>Por favor, acesse o portal e altere sua senha no primeiro acesso.</p>
    <p>Link para acesso: ${process.env.NEXT_PUBLIC_APP_URL}/patient/login</p>
    <p>Atenciosamente,<br>Equipe do Portal</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: patientEmail,
      subject: 'Bem-vindo ao Portal do Paciente',
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

interface SendPasswordResetEmailProps {
  to: string;
  name: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({ to, name, resetLink }: SendPasswordResetEmailProps) {
  await transporter.verify();
  console.log('SMTP connection verified for password reset email');

  await transporter.sendMail({
    from: {
      name: 'MED1',
      address: process.env.SMTP_FROM as string
    },
    to,
    subject: 'Redefinição de senha',
    text: `Olá ${name},\n\nVocê solicitou a redefinição da sua senha. Clique no link abaixo para definir uma nova senha:\n\n${resetLink}\n\nSe você não solicitou esta redefinição, por favor ignore este email.\n\nAtenciosamente,\nEquipe MED1`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Redefinição de Senha</h2>
        <p>Olá ${name},</p>
        <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para definir uma nova senha:</p>
        <p style="text-align: center;">
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Redefinir Senha</a>
        </p>
        <p>Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Se você não solicitou esta redefinição, por favor ignore este email.</p>
        <p>Atenciosamente,<br>Equipe MED1</p>
      </div>
    `
  });

  console.log('Password reset email sent to:', to);
}

interface SendDocumentSharedEmailParams {
  to: string;
  recipientName: string;
  senderName: string;
  documentName: string;
  loginUrl: string;
}

export async function sendDocumentSharedEmail({
  to,
  recipientName,
  senderName,
  documentName,
  loginUrl
}: SendDocumentSharedEmailParams) {
  await transporter.verify();
  console.log('SMTP connection verified for document shared email');

  await transporter.sendMail({
    from: {
      name: 'Xase',
      address: process.env.SMTP_FROM as string
    },
    to,
    subject: 'Document Shared With You',
    text: `Hello ${recipientName},\n\n${senderName} has shared a document with you: "${documentName}".\n\nYou can access this document by logging into your account.\n\n${loginUrl}\n\nRegards,\nMED1 Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Document Shared With You</h2>
        <p>Hello ${recipientName},</p>
        <p><strong>${senderName}</strong> has shared a document with you: <strong>"${documentName}"</strong>.</p>
        <p>You can access this document by logging into your account:</p>
        <p style="text-align: center;">
          <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Login to View Document</a>
        </p>
        <p>If the button above doesn't work, copy and paste the link below into your browser:</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>Regards,<br>Xase Team</p>
      </div>
    `
  });

  console.log('Document shared email sent to:', to);
}
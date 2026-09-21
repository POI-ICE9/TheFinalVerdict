const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

const emailTemplates = {
  welcome: (username) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f4a460;">Benvenuto su TheFinalVerdict!</h1>
      <p>Ciao <strong>${username}</strong>,</p>
      <p>Il tuo aldilà personale ti aspetta. Inizia a giudicare le anime!</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #f4a460; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Entra nel Purgatorio</a>
    </div>
  `,
  passwordReset: (token) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f4a460;">Recupero Password</h1>
      <p>Usa questo link per resettare la tua password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" style="background: #f4a460; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resetta Password</a>
      <p>Il link scade tra 1 ora.</p>
    </div>
  `,
  ticketCreated: (ticketNumber, subject) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f4a460;">Ticket #${ticketNumber} Creato</h1>
      <p>Il tuo ticket "<strong>${subject}</strong>" è stato ricevuto.</p>
      <p>Il nostro staff ti risponderà al più presto.</p>
    </div>
  `,
  ticketResponse: (ticketNumber) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f4a460;">Nuova Risposta al Ticket #${ticketNumber}</h1>
      <p>Lo staff ha risposto al tuo ticket. Accedi per vedere la risposta.</p>
    </div>
  `,
  staffInvite: (role, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f4a460;">Invito Staff TheFinalVerdict</h1>
      <p>Sei stato invitato come <strong>${role}</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/staff/accept?token=${token}" style="background: #f4a460; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accetta Invito</a>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates, transporter };
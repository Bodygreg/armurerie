const resend = require('../config/mailer');

exports.envoyerMessage = async (req, res) => {
  try {
    const { nom, email, message } = req.body;

    if (!nom || !email || !message) {
      return res.status(400).json({ message: 'Nom, email et message sont requis.' });
    }

    const { data, error } = await resend.emails.send({
      from: "L'Armurerie <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Nouveau message de contact — ${nom}`,
      text: `De : ${nom} (${email})\n\nMessage :\n${message}`,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de l'envoi du message." });
    }

    res.status(200).json({ message: 'Votre message a bien été envoyé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
};
import emailjs from '@emailjs/browser';

export function sendEmailNotification({ to, subject, message }) {
  // You must configure your EmailJS service, template, and user ID
  return emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID',
    {
      to_email: to,
      subject,
      message,
    },
    'YOUR_USER_ID'
  );
}

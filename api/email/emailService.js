var nodemailer = require('nodemailer');
var fs = require('fs');
var path = require('path');

async function SendMail(mailText, toEmail, toName, mailSubject, attaches)
{
  // Create a SMTP transporter object
  let transporter = await nodemailer.createTransport(
      {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SSL,
          auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
          },
      },
      {
          // default message fields

          // sender info
          from: process.env.SMTP_SENDER_NAME + '<' + process.env.SMTP_USER + '>',
      }
  );

  // Message object
  let message = {
      // Comma separated list of recipients
      to: toName + ' <' + toEmail + '>',

      // Subject of the message
      subject: mailSubject,

      // Plain text body
      text: mailText,

      // An array of attachments
      attachments: attaches
  };

  await transporter.sendMail(message, (error, info) => {
      if (error) {
          console.log('Error occurred while sending an email');
          console.log(error.message);
          return process.exit(1);
      }

      console.log('Email message sent successfully!');

      // only needed when using pooled connections
      transporter.close();
    })
}

async function SendMailHtml(mailHTML, toEmail, toName, mailSubject, attaches)
{
  // Create a SMTP transporter object
  let transporter = await nodemailer.createTransport(
      {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SSL,
          auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
          },
      },
      {
          // default message fields

          // sender info
          from: process.env.SMTP_SENDER_NAME + '<' + process.env.SMTP_USER + '>',
      }
  );

  // Message object
  let message = {
      // Comma separated list of recipients
      to: toName + ' <' + toEmail + '>',

      // Subject of the message
      subject: mailSubject,

      // HTML body
      html: mailHTML,

      // An array of attachments
      attachments: attaches
  };

  await transporter.sendMail(message, (error, info) => {
      if (error) {
          console.log('Error occurred while sending an email');
          console.log(error.message);
          return process.exit(1);
      }

      console.log('Email message sent successfully!');

      // only needed when using pooled connections
      transporter.close();
    })
}

async function SendMailDoc(relPath, toEmail, toName, mailSubject, htmlReplacements, attaches)
{
  var mailHTML = await fs.readFileSync(path.join(__dirname.replace('api\\email', 'api\\') + '/docs/email/', relPath));
  if (mailHTML == null)
    return

  mailHTML = mailHTML.toString()
  for (var i = 0; i < htmlReplacements.length; ++i)
  {
    mailHTML = mailHTML.replace(htmlReplacements[i].from, htmlReplacements[i].to);
  }

  // Create a SMTP transporter object
  let transporter = await nodemailer.createTransport(
      {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SSL,
          auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
          },
      },
      {
          // default message fields

          // sender info
          from: process.env.SMTP_SENDER_NAME + '<' + process.env.SMTP_USER + '>',
      }
  );

  // Message object
  let message = {
      // Comma separated list of recipients
      to: toName + ' <' + toEmail + '>',

      // Subject of the message
      subject: mailSubject,

      // HTML body
      html: mailHTML,

      // An array of attachments
      attachments: attaches
  };

  await transporter.sendMail(message, (error, info) => {
      if (error) {
          console.log('Error occurred while sending an email');
          console.log(error.message);
          return process.exit(1);
      }

      console.log('Email message sent successfully!');

      // only needed when using pooled connections
      transporter.close();
    })
}

module.exports =
{
    SendMail,
    SendMailHtml,
    SendMailDoc,
}
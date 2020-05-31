const nodemailer = require('nodemailer')

function mail() {
  const methods = {
    async sendMail(email, html, subject) {
      try {
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.smtp_email,
            pass: process.env.smtp_password
          }
        });

        let mailOptions = {
          from: 'gauravbansal0000@gmail.com',
          to: email,
          subject: subject,
          html: html,
        }
        return new Promise(async (resolve, reject) => {
          //   await transporter.verify();
          await transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              reject({
                success: false,
                err: err
              });
            } else {
              resolve({
                success: true,
                data: 'Mail is sent'
              });
            }
          });
        });
      } catch (e) {
        console.log('The error s --> ', e);
        throw new Error(e);
      }
    }
  }
  return Object.freeze(methods)
}
module.exports = mail();

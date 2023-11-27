require('dotenv').config()
const nodemailer = require("nodemailer")

function sendVerificationEmail(toEmail, username, token) {

    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
            auth: {
                user: process.env.MAIL_CLIENT_EMAIL,
                pass: process.env.MAIL_CLIENT_APP_PASS,
            },
        secure: true,
    });
          
    const mailData = {
        from: process.env.MAIL_CLIENT_EMAIL,
        to: toEmail,
        subject: 'Account Verification',
        html: `<p>Hi ${username}, verify your TexZ account here:</p><a href=${process.env.PROTOCOL}://${process.env.DOMAIN}/verify-email/${token}/>Verify Account</a><p>Verification link will expire in 10 minutes.</p>`
    };
    
    transporter.sendMail(mailData, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
    });
}

function sendResetPasswordEmail(toEmail, username, token) {

    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
            auth: {
                user: process.env.MAIL_CLIENT_EMAIL,
                pass: process.env.MAIL_CLIENT_APP_PASS,
            },
        secure: true,
    });
          
    const mailData = {
        from: process.env.MAIL_CLIENT_EMAIL,
        to: toEmail,
        subject: 'Reset Password',
        html: `<p>Hi ${username}, reset password of your TexZ account here:</p><a href=${process.env.PROTOCOL}://${process.env.DOMAIN}/reset-password/${token}/>Reset Password</a>`
    };
    
    transporter.sendMail(mailData, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
    });
}

module.exports = {sendVerificationEmail: sendVerificationEmail, sendResetPasswordEmail: sendResetPasswordEmail}
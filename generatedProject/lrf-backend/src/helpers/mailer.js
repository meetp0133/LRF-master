const nodemailer = require('nodemailer');
const {
    SENDER_EMAIL,
    SENDER_PASSWORD,
    EMAIL_SERVICE
} = require('../../config/key');

module.exports.sendEmail = async (email, emailBody, subject) => {
    try {

        const transporter = nodemailer.createTransport({
            service: EMAIL_SERVICE,
            host: 'smtp.gmail.com',
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_PASSWORD,
            },
            secure: true
        });

        let mailData = {
            from: {
                name: 'LRF-Master',
                address: SENDER_EMAIL,
            },
            to: email,
            subject: subject,
            html: emailBody,
        };
        transporter.sendMail(mailData);

        console.log('Email has been sent successfully to ' + ' ' + email);
        return true;

    } catch (err) {
        console.log('Error(sendEmail)', err);
        return false;
    }
};

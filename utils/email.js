const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.recipientFirstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Natours Admin <${process.env.EMAIL_FROM}>`;
    };

    createTransport() {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        return transporter;
    }

    async sendEmail(template, subject) {
        // Create transporter
        const transporter = this.createTransport();

        // Create email html using pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.recipientFirstName,
            url: this.url,
            subject
        });

        const options = {
            wordwrap: 130,
            // ...
        };

        const text = convert(html, options);

        // Define email options
        const option = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: text
        };

        // Send email
        await transporter.sendMail(option);
    }

    async sendWelcome() {
        await this.sendEmail('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.sendEmail('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }
}
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
    },
});

/**
 * Sends an email using the configured transporter.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} name - The recipient's name to personalize the email.
 * @param {string} resetLink - The reset link for the password reset.
 */
async function sendResetMail(to, subject, name, resetLink) {
    const templatePath = path.resolve(__dirname, "template.html");
    let htmlContent = fs.readFileSync(templatePath, "utf-8");

    htmlContent = htmlContent
        .replace(/{{name}}/g, name)
        .replace(/{{resetLink}}/g, resetLink);

    await transporter.sendMail({
        to,
        subject,
        html: htmlContent,
    });

    console.log('Email sent to', to);
}

module.exports = sendResetMail;

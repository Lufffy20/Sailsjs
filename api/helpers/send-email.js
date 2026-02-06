
const nodemailer = require('nodemailer');

module.exports = {

    friendlyName: 'Send email',

    description: 'Send an email using the configured transpoter.',

    inputs: {
        to: {
            type: 'string',
            required: true,
            description: 'The email address of the recipient.'
        },
        subject: {
            type: 'string',
            required: true,
            description: 'The subject of the email.'
        },
        text: {
            type: 'string',
            required: true,
            description: 'The plain text body of the email.'
        },
        html: {
            type: 'string',
            description: 'The HTML body of the email.'
        }
    },

    exits: {
        success: {
            description: 'The email was sent successfully.'
        },
        error: {
            description: 'Something went wrong when sending the email.'
        }
    },

    fn: async function (inputs, exits) {

        // Check if email config exists
        if (!sails.config.custom.email) {
            sails.log.warn('Cannot send email: "sails.config.custom.email" is not configured.');
            return exits.success();
        }

        try {
            // Create transporter
            let transporter;

            // Check if we are in development/test using Ethereal
            if (sails.config.custom.email.service === 'Ethereal') {
                const testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: testAccount.smtp.host,
                    port: testAccount.smtp.port,
                    secure: testAccount.smtp.secure,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
            } else if (sails.config.custom.email.service) {
                // Use configured service (e.g. Gmail)
                transporter = nodemailer.createTransport({
                    service: sails.config.custom.email.service,
                    auth: sails.config.custom.email.auth
                });
            } else {
                // Use generic SMTP (e.g. Mailtrap)
                transporter = nodemailer.createTransport({
                    host: sails.config.custom.email.host,
                    port: sails.config.custom.email.port,
                    auth: sails.config.custom.email.auth
                });
            }

            // Send email
            let info = await transporter.sendMail({
                from: sails.config.custom.email.from,
                to: inputs.to,
                subject: inputs.subject,
                text: inputs.text,
                html: inputs.html
            });

            sails.log.info(`Email sent to ${inputs.to}: ${info.messageId}`);

            // If using Ethereal, log the preview URL
            if (sails.config.custom.email.service === 'Ethereal') {
                sails.log.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
            }

            return exits.success();

        } catch (err) {
            sails.log.error('Error sending email:', err);
            return exits.error(err);
        }
    }

};

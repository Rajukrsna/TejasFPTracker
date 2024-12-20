const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
require('dotenv').config();

// Initialize SNS client
const snsClient = new SNSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to send SMS
const sendSMS = async (message, phoneNumber) => {
    const params = {
        Message: message,
        PhoneNumber: phoneNumber, 
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Promotional', // or 'Promotional'
            },
        },// Recipient's phone cnumber in E.164 format
    };

    try {
        const command = new PublishCommand(params);
        const result = await snsClient.send(command);
        console.log('SMS sent successfully:', result.MessageId);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

module.exports = { sendSMS };

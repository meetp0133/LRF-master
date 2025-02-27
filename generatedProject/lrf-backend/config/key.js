require('dotenv').config();
         module.exports = {
            DB_AUTH_URL: process.env.DB_AUTH_URL,
            PORT: process.env.PORT,
            JWT_AUTH_TOKEN_SECRET: process.env.JWT_AUTH_TOKEN_SECRET,
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
            IMAGE_LINK: process.env.IMAGE_LINK,
            SENDER_EMAIL: process.env.SENDER_EMAIL,
            SENDER_PASSWORD: process.env.SENDER_PASSWORD,
            EMAIL_SERVICE: process.env.EMAIL_SERVICE,
            ENVIRONMENT: process.env.ENVIRONMENT,
            PAGINATION_LIMIT : 10,
            IS_SSL : process.env.IS_SSL
        }
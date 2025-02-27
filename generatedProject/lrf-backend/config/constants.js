
            module.exports = {

                WEB_STATUS_CODE: {
                    OK: 200,
                    BAD_REQUEST: 400,
                    UNAUTHORIZED: 401,
                    FORBIDDEN: 403,
                    NOT_FOUND: 404,
                    SERVER_ERROR: 500,
                    MAINTENANCE: 503
                },

                META_STATUS: {
                    DATA: 1,                            // When there is success response from api
                    NO_DATA: 0                          // When there is no data found in api  // Not when there is no response data in api response
                },

                STATUS: {
                    ACTIVE: 1,
                    INACTIVE: 2,
                    DELETED: 3
                },

                OTP: {
                    EXPIRES_IN: 5                       // 5 min OTP expiration time
                },

                PAGE: 1,
                LIMIT: 10
                }
const request = require('supertest');
const User = require("../models/user");
const chai = require('chai');
const expect = chai.expect;
require("../index")

const baseUrl = 'http://localhost:3000/api/v1/user/'; // Update this to your actual API base URL
const email = "test1@yopmail.com"

describe('User API Tests', () => {
  describe('Route checkck', () => {
    it('should sendIf there is not any route that match', async () => {
      const res = await request(baseUrl)
        .post('/forgot')
        .send({
          email: email
        });
      expect(res.body.success).to.equal('false');
      expect(res.body.message).to.equal('Page not found');
      expect(res.body.error.statusCode).to.equal(404);
    });
  });


  // 1. Register API Test Cases
  describe('POST /register', () => {
    it('Email already exists', async () => {
      const res = await request(baseUrl)
        .post('/register')
        .send({
          firstName: 'TEST',
          lastName: 'MQT',
          email: email,
          password: 'password123',
          confirmPassword: 'password123'
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('meta');
      expect(res.body.meta.status).to.equal(0);
      expect(res.body.meta.message).to.equal('emailAlreadyExist');
    });

    it('should fail registration with missing email', async () => {
      const res = await request(baseUrl)
        .post('/register')
        .send({
          firstName: 'TEST',
          lastName: 'MQT'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'validationEmailRequired');
      expect(res.body).to.have.property('statusCode', 400);
    });

    it('should fail registration with missing firstName', async () => {
      const res = await request(baseUrl)
        .post('/register')
        .send({
          firstName: '',
          lastName: 'MQT'
        });
      // console.log('res.body------------>', res.body); 
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'validationFirstNameRequired');
      expect(res.body).to.have.property('statusCode', 400);
    });

    it('should fail registration with missing lastName', async () => {
      const res = await request(baseUrl)
        .post('/register')
        .send({
          firstName: 'TEST',
          lastName: ''
        });
      // console.log('res.body------------>', res.body); 

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'validationLastNameRequired');
      expect(res.body).to.have.property('statusCode', 400);
    });

    it('should register user successfully', async () => {
      const res = await request(baseUrl)
        .post('/register')
        .send({
          firstName: 'TEST',
          lastName: 'MQT',
          email: email,
          password: 'password123',
          confirmPassword: 'password123'
        });

      // console.log('res.body------------>', res.body); 
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('meta');
      expect(res.body.meta.status).to.equal(1);
      expect(res.body.meta.message).to.equal('userRegister'); // Verify this matches your API
      expect(res.body.data).to.have.property('firstName', 'TEST');
      expect(res.body.data).to.have.property('lastName', 'MQT');
      expect(res.body.data).to.have.property('email', email); // Fixed email
    });
  });

  describe('POST /Verify-profile', () => {
    it('should verify profile successfully', async () => {
      const res = await request(baseUrl)
        .post('/verify-user')
        .send({
          email: email,
          otp: 1234
        });
      // console.log('res.body-------------------', res.body);
      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(1);
      expect(res.body.meta.message).to.equal('userVerified');
      expect(res.body.meta.isVerified).to.equal(true);
      expect(res.body).to.deep.equal({
        meta: {
          status: 1,
          message: 'userVerified',
          token: res.body.meta.token,
          isVerified: true
        },
        data: {
          userId: res.body.data.userId,
          firstName: res.body.data.firstName,
          lastName: res.body.data.lastName,
          email: res.body.data.email,
          profileImage: '',
          isVerified: true
        },
        statusCode: 200
      })
    });

    it('should fail while otp is expired', async () => {
      const res = await request(baseUrl)
        .post('/verify-user')
        .send({
          email: email,
          otp: 1234
        });
      // console.log('res.body----------', res.body);
      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(0);
      expect(res.body.meta.message).to.equal('otpHasBeenExpired');
      expect(res.body).to.deep.equal({
        meta: { status: 0, message: 'otpHasBeenExpired' },
        data: null,
        statusCode: 200
      })
    });

    it('should fail when pass invalid OTP', async () => {
      const res = await request(baseUrl)
        .post('/verify-user')
        .send({
          email: email,
          otp: 1234789
        });
      // console.log('res.body', res.body);
      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(0);
      expect(res.body.meta.message).to.equal('invalidOtp');
      expect(res.body).to.deep.equal({
        meta: { status: 0, message: 'invalidOtp' },
        data: null,
        statusCode: 200
      });
    });

    it('should fail while not passing email', async () => {
      const res = await request(baseUrl)
        .post('/verify-user')
        .send({
          email: '',
          otp: 1234
        });

      // console.log('res.body', res.body);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('validationEmailRequired');
      expect(res.body.statusCode).to.equal(400);
      expect(res.body).to.deep.equal({
        message: 'validationEmailRequired', statusCode: 400
      })
    });
    it('should fail while not passing otp', async () => {
      const res = await request(baseUrl)
        .post('/verify-user')
        .send({
          email: email
        });

      // console.log('res.body', res.body);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('validationOtpRequired');
      expect(res.body.statusCode).to.equal(400);
      expect(res.body).to.deep.equal({
        message: 'validationOtpRequired', statusCode: 400
      })
    });
  });

  // Forgot/Resend API Test Cases
  describe('POST /forgot', () => {
    it('should fail while email is not exist in db', async () => {
      const res = await request(baseUrl)
        .post('/forgot-password')
        .send({
          email: 'test2121@example.com'
        });

      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(0);
      expect(res.body.meta.message).to.equal('userNotFound');
      expect(res.body.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({
        meta: { status: 0, message: 'userNotFound' },
        data: null,
        statusCode: 200
      })
    });

    it('should send forgot password email successfully', async () => {
      const res = await request(baseUrl)
        .post('/forgot-password')
        .send({
          email: email
        });
      // console.log('res.body------------>', res.body);

      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(1);
      expect(res.body.meta.message).to.equal('otpSendSuccessfully');
      expect(res.body.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({
        meta: { status: 1, message: 'otpSendSuccessfully' },
        data: null,
        statusCode: 200
      })
    });

    it('should fail with missing email', async () => {
      const res = await request(baseUrl)
        .post('/forgot-password')
        .send({});
      // console.log('res.body------------>', res.body); 

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'validationEmailRequired');
    });
  });

  // 3. Reset Password API Test Cases
  describe('POST /reset-password', () => {

    it('should fail while otp is expired', async () => {
      const res = await request(baseUrl)
        .post('/reset-password')
        .send({
          email: email,
          otp: 1234
        });

      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(0);
      expect(res.body.meta.message).to.equal('otpHasBeenExpired');
      expect(res.body).to.deep.equal({
        meta: { status: 0, message: 'otpHasBeenExpired' },
        data: null,
        statusCode: 200
      })
    });

    it('should fail while email is not exist in db', async () => {
      const res = await request(baseUrl)
        .post('/reset-password')
        .send({
          email: 'test2121@example.com',
          otp: 123456,
          password: '123456'
        });

      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(0);
      expect(res.body.meta.message).to.equal('userNotFound');
      expect(res.body.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({
        meta: { status: 0, message: 'userNotFound' },
        data: null,
        statusCode: 200
      })
    });

    it('When OTP is not valid', async () => {
      const res = await request(baseUrl)
        .post('/reset-password')
        .send({
          email: email,
          otp: 123456,
          password: '123456'
        });

      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(0);
      expect(res.body.meta.message).to.equal('otpNotValid');
    });


    it('should reset password successfully', async () => {
      const res = await request(baseUrl)
        .post('/reset-password')
        .send({
          email: email,
          otp: 1234,
          password: '123456'
        });
      // console.log('res.body', res.body);

      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(1);
      expect(res.body.meta.message).to.equal('passwordChangedSuccessfully');
      expect(res.body).to.deep.equal({
        meta: { status: 1, message: 'passwordChangedSuccessfully' },
        data: null,
        statusCode: 200
      })
    });

    it('should fail with invalid data', async () => {
      const res = await request(baseUrl)
        .post('/reset-password')
        .send({
          email: email
        });
      // console.log('res.body',res.body);
      expect(res.status).to.equal(400);
      expect(res.body.statusCode).to.equal(400);
      expect(res.body.message).to.equal("validationOtpRequired");
    });

    it('When there is no user with that email', async () => {
      const res = await request(baseUrl)
        .post('/reset-password')
        .send({
          email: 'test2@yopmail.com',
          otp: 1234,
          password: '123456'
        });
      // console.log('res.body', res.body);
      expect(res.status).to.equal(200);
      expect(res.body.statusCode).to.equal(200);
      expect(res.body.meta.message).to.equal("userNotFound");
      expect(res.body.meta.status).to.equal(0);
    });
  });

  let token = ''
  describe('POST /Login', () => {
    it('When successfully login', async () => {
      const res = await request(baseUrl)
        .post('/login')
        .send({
          email: email,
          password: "123456"
        });

      token = res.body.meta.token || ""
      // console.log('token', token);
      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(1);
      expect(res.body.meta.message).to.equal('userLoggedInSuccessfully');
      expect(res.body.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({
        meta: {
          status: 1,
          message: 'userLoggedInSuccessfully',
          token: token,
          isVerified: true
        },
        data: {
          userId: res.body.data.userId,
          firstName: res.body.data.firstName,
          lastName: res.body.data.lastName,
          email: res.body.data.email,
          profileImage: '',
          isVerified: res.body.data.isVerified
        },
        statusCode: 200
      })
    });

    it('should fail with wrong creds', async () => {
      const res = await request(baseUrl)
        .post('/login')
        .send({
          email: email,
          password: "123456789"
        });

      expect(res.status).to.equal(200);
      expect(res.body.meta).to.have.property('message', 'emailOrPasswordWrong');
      expect(res.body.meta).to.have.property('status', 0);
      expect(res.body).to.have.property('data', null);
      expect(res.body).to.deep.equal({
        meta: { status: 0, message: 'emailOrPasswordWrong' },
        data: null,
        statusCode: 200
      })
    });

    it('Should fail with wrong email', async () => {
      const res = await request(baseUrl)
        .post('/login')
        .send({
          email: 'test1111@example.com',
          password: "123456789"
        });

      expect(res.status).to.equal(200);
      expect(res.body.meta).to.have.property('message', 'emailOrPasswordWrong');
      expect(res.body.meta).to.have.property('status', 0);
      expect(res.body).to.have.property('data', null);
      expect(res.body).to.deep.equal({
        meta: { status: 0, message: 'emailOrPasswordWrong' },
        data: null,
        statusCode: 200
      })
    });

    it('should fail with missing email', async () => {
      const res = await request(baseUrl)
        .post('/login')
        .send({
          email: '',
          password: "123456"
        });
      // console.log('res.body------------>', res.body); 

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'validationEmailRequired');
    });

    it('should fail with missing password', async () => {
      const res = await request(baseUrl)
        .post('/login')
        .send({
          email: email,
          password: ""
        });
      // console.log('res.body------------>', res.body); 

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message', 'validationPasswordRequired');
    });
  });

  // 4. Update Profile API Test Cases
  describe('POST /update-profile', () => {
    it('should update profile successfully', async () => {
      // console.log('token', token);
      const res = await request(baseUrl)
        .post('/edit-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'test',
          lastName: 'mqt'
        });

      // console.log('Response:', res.body);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('meta');
      expect(res.body.meta).to.have.property('status').that.equals(1);
      expect(res.body).to.deep.equal({
        meta: {
          status: 1,
          message: 'profileEditSuccessfully',
          isVerified: true,
        },
        data: {
          firstName: res.body.data.firstName,
          lastName: res.body.data.lastName,
          profileImage: '',
          email: email,
          isVerified: true,
          userId: res.body.data.userId
        },
        statusCode: 200
      });
    });

    it('should fail update profile with missing firstName', async () => {
      const res = await request(baseUrl)
        .post('/edit-profile')
        .send({
          firstName: 'test',
          lastName: 'MQT'
        });
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('tokenNotFound');
      expect(res.body.statusCode).to.equal(401);
    });

  });

  // 5. View Profile API Test Cases
  describe('POST /view-profile', () => {
    it('should get profile successfully', async () => {
      const res = await request(baseUrl)
        .post('/view-profile')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).to.equal(200);
      expect(res.body.meta.status).to.equal(1);
      expect(res.body.meta.message).to.equal('userProfileFoundSuccessFully');
      expect(res.body.data).to.have.property('firstName');
      expect(res.body.data).to.have.property('lastName');
    });

    it('should fail without token', async () => {
      const res = await request(baseUrl)
        .post('/view-profile');

      // console.log('res.body',res.body);
      // console.log('res.status',res.status);

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('tokenNotFound');
    });

    it('Check view profile response', async () => {
      const res = await request(baseUrl)
        .post('/view-profile')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({
        meta: { status: 1, message: 'userProfileFoundSuccessFully' },
        data: {
          userId: res.body.data.userId,
          firstName: res.body.data.firstName,
          lastName: res.body.data.lastName,
          email: res.body.data.email,
          profileImage: '',
          isVerified: res.body.data.isVerified
        },
        statusCode: 200
      });

      await User.deleteOne({ email: email });
    });
  });



});
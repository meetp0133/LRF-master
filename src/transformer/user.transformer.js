const constants = require("../../config/constants");
const { imageURL } = require("../helpers/helper");

exports.userTransformer = (data) => {
    return {
        userId: data?._id ? data._id : "",
        firstName: data?.firstName ? data.firstName : "",
        lastName: data?.lastName ? data.lastName : "",
        email: data?.email ? data.email : "",
        profileImage: data?.profileImage ? imageURL(data.profileImage, 'user') : '',
        isVerified: data?.isVerified ? data.isVerified : false,
      };
};

exports.userViewTransformer = (arrayData) => {
    let data = null;
    if (arrayData) {
        data = this.userTransformer(arrayData);
    }
    arrayData = data;
    return arrayData;
};

const helper = require('../helpers/helper')

exports.transformAdmin = (data) => {
    return {
        adminId: data?._id ? data._id : '',
        firstName: data?.firstName ? data.firstName : '',
        lastName: data?.lastName ? data.lastName : '',
        email: data?.email ? data.email : '',
        profileImage: data?.profileImage ? helper.imageURL(data.profileImage, 'user', 'profileImage') : helper.imageURL(data.profileImage, 'user', 'profileImage'),
        status: data?.status ? data.status : 1
    };
};

exports.adminTransformer = (arrayData) => {
    let adminData = null;
    if (arrayData) {
        adminData = this.transformAdmin(arrayData);
    }
    return adminData;
};

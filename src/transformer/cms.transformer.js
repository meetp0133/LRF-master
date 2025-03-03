
exports.transform = (data) => {
    return {
        cmsId: data?._id ? data._id : '',
        slug: data?.slug ? data.slug : '',
        title: data?.title ? data.title : '',
        description: data?.description ? data.description : '',
    };
};

exports.transformViewCms = (arrayData) => {
    let data = null;
    if (arrayData) {
        data = this.transform(arrayData);
    }
    arrayData = data;
    return arrayData;
};

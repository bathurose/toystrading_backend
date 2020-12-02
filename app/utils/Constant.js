/**
 * Created by s3lab. on 1/17/2017.
 */
// const DELETED = {
//     NO: 0,
//     YES: 1
// };

const ACTIVATED = {
    NO: 0,
    YES: 1
};
const EMAIL_ACTIVATED = {
    NO: 0,
    YES: 1
};

// const SYSTEM = {
//     NO: 0,
//     YES: 1
// };

// const USER_TYPE = {
//     ANONYMOUS: 1,
//     END_USER: 2,
//     MODERATOR: 3,
//     ADMINISTRATOR:4,
//     SUPER_ADMIN: 5
// };
const USER_TYPE = {
    MODERATOR: 1,
    ADMINISTRATOR:2,
    SUPER_ADMIN: 3
};

module.exports = {
    ACTIVATED,
    USER_TYPE,
    EMAIL_ACTIVATED,
    THUMBNAIL_NAME_SUFFIX:'_thumb',
    CONTENT_TYPE_ENUM: ['*', 'bestProduct','video','advertiseText'],
    MAX_ASSET_SIZE_ALLOW: 1073741824,
    MAX_THUMB_SIZE_ALLOW: 1048576,
    DEFAULT_PAGING_SIZE: 25
};

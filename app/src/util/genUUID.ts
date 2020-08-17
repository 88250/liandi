import * as crypto from 'crypto';

export const genUUID = () => ([1e7].toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (parseInt(c, 10) ^ (crypto.randomBytes(1)[0] & (15 >> (parseInt(c, 10) / 4)))).toString(16)
);

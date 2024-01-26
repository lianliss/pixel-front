'use strict';
export const getQueryParams = urlString => {
    function removeEmpty(obj) {
        Object.keys(obj).forEach(function(key) {
            if (obj[key] && typeof obj[key] === 'object') removeEmpty(obj[key])
            else if (obj[key] == null) delete obj[key]
        });
        return obj;
    }

    const data = {};
    if(typeof urlString !== 'string' ) return data;
    // eslint-disable-next-line no-return-assign,node/no-unsupported-features/node-builtins
    new URL(urlString).search.substr(1).split('&').map((o, i, a, p = o.split('=')) => data[p[0]] = p[1]);
    return removeEmpty(data);
};

export default getQueryParams;

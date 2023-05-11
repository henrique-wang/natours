// Receive cookiesHeader Array<String>
// Example:
// Receive: ['jwt=jwtToken', 'cookie1=valueCookie1']
// Returns: {'jwt': 'jwtToken', 'cookie1': 'valueCookie1'}
const paramsToObject = cookiesHeader => {
    let result = {};
    for (const cookie of cookiesHeader) {
        const keyValue = cookie.split('=');
        result[keyValue[0]] = keyValue[1];
    }
    return result;
};

const filterUndefinedValuesObject = object => {
    let result = {};
    for (const value in object) {
        if (object[value]) result[value] = object[value];
    };
    return result;
}

module.exports = {
    paramsToObject,
    filterUndefinedValuesObject
}
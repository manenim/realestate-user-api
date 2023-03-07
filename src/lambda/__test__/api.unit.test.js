const { getUser } = require('../api.js') 


test('Responses is an object', () => {
    expect(typeof getUser()).toBe('object')
})


// test that response object contains statuscode

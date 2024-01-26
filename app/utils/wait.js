const wait = delay => new Promise(fulfill => setTimeout(fulfill, delay));
export default wait;

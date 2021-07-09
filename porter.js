const { getPort } = require("./ports")

const [,, domain] = process.argv

console.log(getPort(domain))
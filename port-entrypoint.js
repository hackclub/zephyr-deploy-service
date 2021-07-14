const { getPort } = require("./ports");

const domain = process.argv[process.argv.length - 1];

const port = getPort(domain)

process.stdout.write(port)
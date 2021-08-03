const { getPort } = require("./ports");

const domain = process.argv[process.argv.length - 1];

const port = getPort(domain, true)

process.stdout.write(port.toString())

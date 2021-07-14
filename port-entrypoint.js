const { getPort } = require("./ports");

const [...others, domain] = process.argv;

const port = getPort(domain)

process.stdout.write(port)
const fs = require("fs")
const { join } = require("path")
const envfile = require('envfile')

const dir = "./test/portly"

export const getPorts = () => {
    return JSON.parse(fs.readFileSync("./ports.json"))
}

const random = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const genPort = (json) => {
    const port = random(1000, 9999)
    console.log(port)
    const ports = json || Object.entries(JSON.parse(fs.readFileSync("./ports.json")))
    if (port in ports) {
        return genPort(ports)
    } else {
        return port
    }
}

const reservePort = (domain) => {
    const port = genPort()

    const env = fs.readFileSync(join(dir, domain, '.env'))
    env.PORT = port
    fs.writeFileSync(join(dir, domain, '.env'), envfile.stringify(env))
    const ports = getPorts()
    ports[domain] = port
    fs.writeFileSync("./ports.json", JSON.stringify(ports, null, 2))

    return port
}

const getPort = (domain) => {
    return getPorts()[domain]
}

const freePort = (domain) => {
    let ports = getPorts()
    if (ports[domain] && fs.existsSync(join(dir, domain, '.env'))) {
        let { PORT, ...env } = envfile.parse(fs.readFileSync(join(dir, domain, '.env')));
        // remove env[domain];
        console.log(env)
        fs.writeFileSync(join(dir, domain, '.env'), envfile.stringify(env))
        
        let { [domain]: cacheRemoved, ...portsUpdate } = ports;
        fs.writeFileSync("./ports.json", JSON.stringify(portsUpdate, null, 2))

    }

    return domain
}

module.exports = {
    freePort,
    getPort,
    reservePort,
    genPort,
    getPorts
}
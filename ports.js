const fs = require("fs")
const { join } = require("path")

const dir = "/opt/zephyrnet"
const ports_file = "/opt/ports/ports.json"

 const getPorts = () => {
    return JSON.parse(fs.readFileSync(ports_file))
}

const random = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

 const genPort = (json) => {
    const port = random(1000, 9999)
    console.log(port)
    const ports = json || Object.entries(JSON.parse(fs.readFileSync(ports_file)))
    if (port in ports) {
        return genPort(ports)
    } else {
        return port
    }
}

const reservePort = (domain) => {
    const port = genPort()
    const ports = getPorts()
    ports[domain] = port
    fs.writeFileSync(ports_file, JSON.stringify(ports, null, 2))

    return port
}

const getPort = (domain) => {
    const port = getPorts()[domain]
    if (port) {
        return port    
    } else {
        return reservePort(domain)
    }
    
}

const freePort = (domain) => {
    let ports = getPorts()
    if (ports[domain]) {
        let { [domain]: cacheRemoved, ...portsUpdate } = ports;
        fs.writeFileSync(ports_file, JSON.stringify(portsUpdate, null, 2))

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
const { existsSync, writeFileSync } = require('fs')
const lockfile = require('proper-lockfile')
const portfinder = require('portfinder')

const portsDir = "./ports"

const getPortRecursive = async (domain) => {
    return await portfinder.getPort((err, port) => {
        if (err) {
            throw err
        }

        const exists = existsSync(`${portsDir}/${port}`)
        if (exists) {
            console.log(`Port ${port} is already in use... Trying to find another open port.`)
            return await getPortRecursive(domain)
        } else {
            const file = `${portsDir}/${port}`
            writeFileSync(file, domain)

            return port
        }
    })
}
const getPort = (domain, recursivelyCalled = false) => {
    const lock = lockfile.lockSync(portsDir)

    const freePort = getPortRecursive(domain)

    lock.unlock()

    return freePort
}


module.exports = {
    getPort
}
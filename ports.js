const { existsSync } = require('fs')
const lockfile = require('proper-lockfile')

const portsDir = "./ports"

const portIsInUse = (port) => {
    const result = execSync(`sudo lsof -nP -iTCP:${port} -sTCP:LISTEN >&2 >/dev/null ; echo $?`).toString()
    return result.trim() === '0'
}

const portIsAllocated = (port) => {
    const exists = existsSync(`${portsDir}/${port}`)
    return exists
}

const getPort = (domain) => {
    const lock = lockfile.lockSync(portsDir)

    const randomPort = Math.random() * (65535 - 1024) + 1024 // port range is 1024-65535
    if (portIsInUse(randomPort) || portIsAllocated(randomPort)) {
        return getPort(domain)
    } else {
        lock.unlockSync(portsDir)
        return randomPort
    }
}


module.exports = {
    getPort,
}
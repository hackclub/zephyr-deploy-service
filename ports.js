const { existsSync, writeFileSync } = require('fs')
const lockfile = require('proper-lockfile')
const { execSync } = require('child_process')

const portsDir = "/opt/zephyr/watcher/ports"

const portIsInUse = (port) => {
    const result = execSync(`sudo lsof -nP -iTCP:${port} -sTCP:LISTEN >&2 >/dev/null ; echo $?`).toString()
    return result.trim() === '0'
}

const portIsAllocated = (port) => {
    const exists = existsSync(`${portsDir}/${port}`)
    return exists
}

const getPort = (domain, entrypoint=false) => {
    const existingPort = execSync(`egrep -lir "^${domain}$" /opt/zephyr/watcher/ports | xargs basename 2>/dev/null`)
    if (existingPort) return existingPort

    !entrypoint && console.log('Trying to get a domain for', domain)

    !entrypoint && console.log(`...adding lockfile on port directory`)
    const releaseLock = lockfile.lockSync(portsDir)

    const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024) // port range is 1024-65535
    !entrypoint && console.log(`...trying port '${randomPort}'`)
    if (portIsInUse(randomPort) || portIsAllocated(randomPort)) {
        !entrypoint && console.log(`...port ${randomPort} is not available`)
        return getPort(domain)
    } else {
        !entrypoint && console.log(`...port ${randomPort} is available`)

        !entrypoint && console.log(`...writing port allocation to /opt/zephyr/watcher/ports/${randomPort}`)
        writeFileSync(`${portsDir}/${randomPort}`, domain)

        !entrypoint && console.log('...removing lockfile on port directory')
        releaseLock()
        

        return randomPort
    }
}

const findPort = () => 


module.exports = {
    getPort,
}
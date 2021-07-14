const {existsSync, unlinkSync} = require('fs')
const { execSync } = require("child_process")
const { default: pdnsChange } = require('./pdns')

const [, , folder, methods, file] = process.argv
console.log(process.argv)
const name = folder.split("/")[3]

// Note: Removing the /opt/zephyr/watcher/repo folder is intentionally left out of this to prevent accidental deletions from removing history

execSync(`sudo systemctl stop zephyrnet-${name}.zephyr-deployment.service`)


// Remove systemctl files
const systemctlFile = `/etc/systemd/system/zephyrnet-${name}.zephyr-deployment.service`
if (existsSync(systemctlFile)) {
    unlinkSync(systemctlFile)
}

execSync(`rm -rf /opt/zephyr/repos/watcher${name}`)

// Reload systemctl
execSync(`systemctl daemon-reload`)

pdnsChange({
    domain: name,
    changetype: "DELETE"
})

// Remove port from list of assigned ports
const port = execSync(`grep -rlw '/opt/zephyr/watcher/ports' -e '${name}'`)
if (port) {
    unlinkSync(`/opt/zephyrnet/watcher/ports/${port}`)
}

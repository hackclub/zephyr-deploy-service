const {existsSync, unlinkSync, unlink} = require('fs')
const { execSync } = require("child_process")
const fetch = require('sync-fetch')

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

// Remove DNS records
const removeRecord = (obj) => fetch("http://10.10.8.210:9191/api/v1/servers/localhost/zones/zephyr", {
    body: `{

"rrsets": [
  {
    "name": "${obj.name}.",
    "type":"${obj.type}",
"ttl": 1,          
"changetype": "DELETE",
    "records": [
      {       "content": "${obj.content}",
        "disabled": false,
        "type": "${obj.type}",
        "priority": 0
      }
    ]
  }          ]      }`,
    headers: {
        "Content-Type": "application/json",

        "X-Api-Key": "TUJ0WjVRSk4yWmF1aFM2"
    },
    method: "PATCH"
})

removeRecord({
    type: "A",
    content: "10.10.8.210",
    name
})

// Remove port from list of assigned ports
const port = execSync(`grep -rlw '/opt/zephyr/watcher/ports' -e '${name}'`)
if (port) {
    unlinkSync(`/opt/zephyrnet/watcher/ports/${port}`)
}

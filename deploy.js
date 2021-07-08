const { readdirSync, readFileSync } = require('fs')
const fetch = require('sync-fetch')

const [, , folder, methods, file] = process.argv;

const addRecord = (obj) => fetch("http://10.10.8.210:9191/api/v1/servers/localhost/zones/zephyr", {
    body: `{

"rrsets": [
  {
    "name": "${obj.name}.",
    "type":"${obj.type}",
"ttl": 1,          
"changetype": "REPLACE",
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

// We need to check only on file creation, not folders, and we can emulate first-tier checking
if (!methods.includes("ISDIR") && folder.endsWith(".zephyr/")) {
    switch (file) {
        case "entry.sh":

        case "index.html":
            const files = readdirSync(folder)
            if (files.includes("entry.sh")) {
                console.log(`[log] index.html found in a dynamic directory, skipping process.`)    
            } else {
                console.log(`[log] loading static file loader`)
                const staticConfTemplate = compile(readFileSync('/opt/zephyr/watcher/static_conf_template.hbs', 'utf8'))
                const name = folder.split("/")[3]
                writeFileSync(`/etc/nginx/sites-enabled/${dir}.conf`, staticConfTemplate({
                    site: dir
                }))
            }
            
        default:
            console.log("[warn] could not identify type of directory.")
            break
    }
}
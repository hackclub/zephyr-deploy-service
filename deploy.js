const { readdirSync, readFileSync, writeFileSync } = require('fs')
const { parse } = require('envfile')
const fetch = require('sync-fetch')
const { compile } = require("handlebars")

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
	const readmeTemplate = compile(readFileSync('/opt/zephyr/watcher/README_template.hbs', 'utf8'))
	writeFileSync(`/opt/zephyrnet/${dir}/README.md`, readmeTemplate({
		site: dir
	}))

    switch (file) {
        case "entry.sh":
            const files = readdirSync(folder)
            if (files.includes('.env')) {
                console.log("[warn] no port found yet.")
            } else {
                const 
            }
        case "index.html":
            const files = readdirSync(folder)
            if (files.includes("entry.sh")) {
                console.log(`[log] index.html found in a dynamic directory, skipping process.`)    
            } else {
                console.log(`[log] loading static file loader`)
                const staticConfTemplate = compile(readFileSync('/opt/zephyr/watcher/static_conf_template.hbs', 'utf8'))
                const name = folder.split("/")[3]
                
                writeFileSync(`/etc/nginx/sites-enabled/${name}.conf`, staticConfTemplate({
                    site: name
                }))

                addRecord({
                    name,
                    type: "A",
                    content: "10.10.8.210"
                })

            }
            
        default:
            console.log("[warn] could not identify type of directory.")
            break
    }
}
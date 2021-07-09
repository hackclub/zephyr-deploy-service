const { readdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } = require('fs')
const { parse } = require('envfile')
const fetch = require('sync-fetch')
const { compile } = require("handlebars");
const { execSync } = require('child_process')
const { reservePort } = require('./ports')
const path = require('path');

const [, , folder, methods, file] = process.argv;
console.log(process.argv)

const execute = (arr) => {
	return arr.map(s => {
		return execSync(s).toString()
	})
}

if (methods.includes("ISDIR") && file.endsWith(".zephyr")) {
    const originRepo = `${folder}${file}`
    const deployRepo = `/opt/zephyr/repos/${file}`

    // Create the deploy repo & copy the git hook to it
    execute([`git init ${deployRepo} --bare --shared`])
    copyFileSync('/opt/zephyr/watcher/git_post_recieve_template.bash', `${deployRepo}/hooks/post-receive`)

    // Create the origin repo and give it the deploy repo as a remote
    execute([`git init ${originRepo} --shared`])
    execute([`cd ${originRepo} && git remote add deploy zephyrnet.hackclub.com:${deployRepo}`])

    if (!existsSync(`/opt/zephyrnet/${file}/README.md`)) {
        const readmeTemplate = compile(readFileSync('/opt/zephyr/watcher/README_template.hbs', 'utf8'))
        writeFileSync(`/opt/zephyrnet/${file}/README.md`, readmeTemplate({
            site: file 
        }))
        execute([`chmod -R a+wr ${originRepo}/README.md`])
    }

    // Lazy way to make sure everyone can commit/push/pull & 
    execute([`chmod -R a+wr ${originRepo}/.git`])
    execute([`chmod -R a+wrx ${deployRepo}`])
}

// Helper function to add in a DNS record to a given domain.
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
            const files = readdirSync(folder)
            if (files.includes('.env')) {
                const env = parse(readFileSync(path.join(folder, '.env')))
                const port = env.PORT || env.port || undefined
                if (port) {
                    const dynamicConfTemplate = compile(readFileSync('/opt/zephyr/watcher/dynamic_conf_template.hbs', 'utf8'))
                    const name = folder.split("/")[3]
                
                    writeFileSync(`/etc/nginx/sites-enabled/${name}.conf`, dynamicConfTemplate({
                        site: name,
                        port
                    }))

                addRecord({
                    name,
                    type: "A",
                    content: "10.10.8.210"
                })

                }
            } else {
                const name = folder.split("/")[3]
                console.log("[warn] no port found yet.")
                // Generate port file
                writeFileSync(path.join(folder, '.env'), "# Created by porter (/opt/zephyr/watcher/ports.js")
                const port = reservePort(name)
                const dynamicConfTemplate = compile(readFileSync('/opt/zephyr/watcher/dynamic_conf_template.hbs', 'utf8'))
                    
                
                    writeFileSync(`/etc/nginx/sites-enabled/${name}.conf`, dynamicConfTemplate({
                        site: name,
                        port
                    }))

                addRecord({
                    name,
                    type: "A",
                    content: "10.10.8.210"
                })
            }
        case "index.html":
            const fs = readdirSync(folder)
            if (fs.includes("entry.sh")) {
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
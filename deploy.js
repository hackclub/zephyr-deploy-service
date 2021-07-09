const { readdirSync, readFileSync, writeFileSync } = require('fs')
const { parse } = require('envfile')
const fetch = require('sync-fetch')
const { compile } = require("handlebars");
const { execSync } = require('child_process')
const path = require('path');

const [, , folder, methods, file] = process.argv;
console.log(process.argv)

const execute = (arr) => {
	return arr.map(s => {
		return execSync(s).toString()
	})
}

if (methods.includes("ISDIR") && file.endsWith(".zephyr")) {
    execute([`git init /opt/zephyr/repos/${folder}${file} --bare --shared`])
    execute([`git init ${folder}${file} --shared`])
    execute([`git remote add deploy /opt/zephyr/repos/${folder}${file}/.git ${folder}${file}`])
    writeFileSync(`/opt/zephyr/repos/${file}/.git/hooks/post-receive`, readFileSync('/opt/zephyr/watcher/git_post_recieve_template.bash', 'utf8'))

}

if (methods.includes("ISDIR") && file.endsWith(".zephyr")) {
    execute([`git init ${folder}${file}`])
    const readmeTemplate = compile(readFileSync('/opt/zephyr/watcher/README_template.hbs', 'utf8'))
    writeFileSync(`/opt/zephyrnet/${file}/README.md`, readmeTemplate({
        site: file 
    }))
}

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
                console.log("[warn] no port found yet.")
                // Generate port file
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
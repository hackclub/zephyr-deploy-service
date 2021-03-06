const { readdirSync, readFileSync, writeFileSync, existsSync } = require('fs')
const { compile } = require("handlebars");
const { execSync } = require('child_process')
const { getPort } = require('./ports');
const { pdnsChange } = require('./pdns');

const [, , folder, methods, file] = process.argv;
console.log(process.argv)

const execute = (arr) => {
    return arr.map(s => {
        return execSync(s).toString()
    })
}

if (methods.includes("ISDIR") && file.endsWith(".zephyr")) {
    const originRepo = `${folder}${file}`
    const deployRepo = `/opt/zephyr/watcher/repos/${file}`

    // Create the deploy repo & copy the git hook to it
//    execute([`mkdir ${deployRepo}`])
    execute([`git init ${deployRepo} --shared`])
    execute([`cd ${deployRepo}; git config receive.denyCurrentBranch updateInstead`])
    const getHookTemplate = compile(readFileSync('/opt/zephyr/watcher/git_post_recieve_template.bash.hbs', 'utf8'))
    writeFileSync(`${deployRepo}/.git/hooks/post-receive`, getHookTemplate({
        site: file
    }))

    // Create the origin repo and give it the deploy repo as a remote
    if (!existsSync(`${originRepo}/.git`)) {
        execute([`git init ${originRepo} --shared`])
    }
    execute([`cd ${originRepo} && git remote add deploy git@zephyrnet.hackclub.com:${deployRepo}`])

    //setTimeout(() => {
	// run delayed to silence errors from recently cloned repos
        const readmeExists = existsSync(`/opt/zephyrnet/${file}/README.md`)

        const filename = readmeExists ? 'zephyr_deployment.md' : 'README.md'
        const readmeTemplate = compile(readFileSync('/opt/zephyr/watcher/README_template.hbs', 'utf8'))
        writeFileSync(`/opt/zephyrnet/${file}/README.md`, readmeTemplate({
            site: file
        }))
        execute([`chmod -R a+wr ${originRepo}/${filename}`])
	execSync(`chmod a+wrx /opt/zephyrnet/${file}/README.md`)
   // }, 500)

    // Lazy way to make sure everyone can commit/push/pull & 
    execute([`chmod -R a+wr ${originRepo}/.git`])
    execute([`chmod -R a+wrx ${deployRepo}`])
}

// We need to check only on file creation, not folders, and we can emulate first-tier checking
if (!methods.includes("ISDIR") && folder.endsWith(".zephyr/")) {
    switch (file) {
        case "entrypoint.sh": {
            execSync(`chmod +x ${folder}${file}`)
            if (readdirSync(folder).includes("index.html")) {
                console.log('[warn] index.html already exists in folder, ignoring entrypoint.sh...')
                break
            }
            const dynamicConfTemplate = compile(readFileSync('/opt/zephyr/watcher/dynamic_conf_template.hbs', 'utf8'))
            const name = folder.split("/")[3].trim()
            const port = getPort(name).toString().trim()
            console.log(`Port '${port}' allocated to domain '${name}'`)

            writeFileSync(`/etc/nginx/sites-enabled/${name}.conf`, dynamicConfTemplate({
                site: name.trim(),
                port
            }))

            pdnsChange({
                domain: name,
                changetype: "REPLACE" // this is PDNS's way of adding or updating a record
            })

            execute(['sudo nginx -s reload'])

            
            break
        }
        case "index.html": {
            if (readdirSync(folder).includes("entrypoint.sh")) {
                console.log('[warn] entrypoint.sh already exists in folder, ignoring index.html...')
                break
            }
            console.log(`[log] loading static file loader`)
            const staticConfTemplate = compile(readFileSync('/opt/zephyr/watcher/static_conf_template.hbs', 'utf8'))
            const name = folder.split("/")[3].trim()

            writeFileSync(`/etc/nginx/sites-enabled/${name}.conf`, staticConfTemplate({
                site: name
            }))
		console.log(name)

	    console.log(pdnsChange({
		    domain: name,
		    changetype: "REPLACE"
	    }))
            execute(['sudo nginx -s reload'])
console.log("hi")
            break
        }
        default:
            console.log("[warn] could not identify type of directory.")

            break
    }
}

// Only runs when folder is copied in
if (methods.includes("ISDIR") && file.endsWith(".zephyr")) {
    let type = "none"

    const path = `${folder}${file}`
    const files = readdirSync(path)
    files.forEach((file) => {
        if (file === "entrypoint.sh") {
            type = "dynamic"
        } else if (file === "index.html" && type !== "dynamic") {
            type = "static"
        }
    })
    const name = file
    console.log(type)

    switch (type) {
        case "dynamic":
            const dynamicConfTemplate = compile(readFileSync('/opt/zephyr/watcher/dynamic_conf_template.hbs', 'utf8'))
            
            const port = getPort(name)
            execSync(`chmod +x ${folder}${file}/entrypoint.sh`)
            console.log(`Port '${port}' allocated to domain '${name}'`)

            writeFileSync(`/etc/nginx/sites-enabled/${name}.conf`, dynamicConfTemplate({
                site: name.trim(),
                port
            }))

		    pdnsChange({
			    domain: name,
			    changetype: "REPLACE"
		    })

            break
        case "none":
        case "static":
            const staticConfTemplate = compile(readFileSync('/opt/zephyr/watcher/static_conf_template.hbs', 'utf8'))
            

            writeFileSync(`/etc/nginx/sites-enabled/${name}.conf`, staticConfTemplate({
                site: name
            }))

		    pdnsChange({
			    domain: name,
			    changetype: "REPLACE"})

            break
    }

    execute(['sudo nginx -s reload'])
}

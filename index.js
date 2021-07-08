const { compile } = require("handlebars")
const { readFileSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')
const fetch = require('sync-fetch')

const [, , name, methods, dir] = process.argv;

if (dir.endsWith('.zephyr') && methods.includes("ISDIR")) {
	const staticConfTemplate = compile(readFileSync('/opt/zephyr/watcher/static_conf_template.hbs', 'utf8'))
	writeFileSync(`/etc/nginx/sites-enabled/${dir}.conf`, staticConfTemplate({
		site: dir
	}))
	
	const x = fetch("http://10.10.8.210:9191/api/v1/servers/localhost/zones/zephyr", {
		body: `{

	"rrsets": [
	  {
		"name": "${dir}.",
		"type": "A",
"ttl": 1,          
"changetype": "REPLACE",
		"records": [
		  {       "content": "10.10.8.210",
			"disabled": false,
			"type": "A",
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

const execute = (arr) => {
	return arr.map(s => {
		return execSync(s).toString()
	})
}


console.log(execute([`git init ${name}${dir}`, `echo "*.conf" > /opt/zephyrnet/${dir}/.gitignore`, 'sudo nginx -s reload', `ln -s /etc/nginx/${dir}.conf /opt/zephyrnet/${dir}`]))
}
console.log('ALL DONE')
// }

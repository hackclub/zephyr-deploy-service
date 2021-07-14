const { readFileSync } = require("fs")
const { compile } = require("handlebars")

const [,,site, port] = process.argv

const  template = compile(readFileSync('/opt/zephyr/watcher/systemd-unit-template.service.hbs').toString())

console.log(template({
    site,
    port
}))
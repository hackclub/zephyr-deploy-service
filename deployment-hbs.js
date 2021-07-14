const { readFileSync } = require("fs")
const { compile } = require("handlebars")

const [,,site, port] = process.argv

const  template = compile(readFileSync('./systemd-unit-template.service.hbs').toString())

console.log(template({
    site,
    port
}))
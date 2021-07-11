const { mkdirSync, existsSync } = require("fs")
const { copySync } = require("fs-extra")
const randomword = require("random-words")

const create = () => {
    const random = randomword()
    const path = `/opt/zephyrnet/${random}.zephyr`
    if (!existsSync(path)) {
        mkdirSync(path)
        
        return path
    } else {
        return create()
    }
}

const path = create()

console.log(path)

copySync("./templates/static", path)

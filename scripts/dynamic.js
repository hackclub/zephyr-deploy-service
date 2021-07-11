const { mkdirSync, existsSync } = require("fs")
const { copySync } = require("fs-extra")
const { execSync } = require("child_process")
const randomword = require("random-words")

const create = () => {
    const randopm = randomword()
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

copySync("./templates/dynamic", path)

execSync('yarn install', { cwd: path })


const fetch = require('sync-fetch')

const PDNS_IP = "10.101.252.250"
const PDNS_URL = `http://${PDNS_IP}:9191`
const PDNS_KEY = 'SDZVZmhZTk0xWWI1SUJQ'

const pdnsChange = ({ domain, changetype }) => {
  return fetch(`${PDNS_URL}/api/v1/servers/localhost/zones/zephyr`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": PDNS_KEY
    },
    body: JSON.stringify({
      rrsets: [{
        name: `${domain}.`,
        type: "A",
        ttl: 1,
        changetype: changetype,
        records: [{
          content: PDNS_IP,
          disabled: false,
          type: "A",
          priority: 0
        }]
      }]
    })
  })
}

module.exports = {
  pdnsChange
}

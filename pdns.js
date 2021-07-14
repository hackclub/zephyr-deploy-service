const fetch = require('sync-fetch')

const PDNS_IP = "10.10.8.210"
const PDNS_URL = `http://${PDNS_IP}:9191`

const pdnsChange = ({ domain, changetype }) => {
  fetch(`${PDNS_URL}/api/v1/servers/localhost/zones/zephyr`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": "TUJ0WjVRSk4yWmF1aFM2"
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

export default pdnsChange
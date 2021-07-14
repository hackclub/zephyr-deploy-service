This script runs on the following assumptions:

- This is running in `/opt/zephyr/watcher`
- There is a folder in `/opt/zephyrnet`
- There is a symlink from `/etc/systemd/system/deploy.service` -> `/opt/zephyr/watcher/deploy.service`
  - Get it running with `systemctl daemon-reload`
  - Get it running with `systemctl start deploy`
  - Get it running with `systemctl enable deploy`
- Run yarn install
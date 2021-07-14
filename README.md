This script runs on the following assumptions:

- This is running in `/opt/zephyr/watcher`
- There is a folder in `/opt/zephyrnet`
- There is a symlink from `/etc/systemd/system/deploy.service` -> `/opt/zephyr/watcher/deploy.service`
  - Get it running with `systemctl daemon-reload`
  - Get it running with `systemctl start deploy`
  - Get it running with `systemctl enable deploy`
- There is a `git` user with a home directory
  - The `git` user has read/write access to
    - `/opt/zephyr/watcher/ports`
    - `/opt/zephyr/watcher/repos`
  - The `git` user has passwordless sudo access to
    - systemctl
    - lsof
- Run yarn install
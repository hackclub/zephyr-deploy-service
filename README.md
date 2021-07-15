This script runs on the following assumptions:

# Setup

- This is running in `/opt/zephyr/watcher`
  - Run `yarn install`
- There is a folder in `/opt/zephyrnet`
- There is a symlink from `/etc/systemd/system/create-deploy.service` -> `/opt/zephyr/watcher/create-deploy.service`
- There is a symlink from `/etc/systemd/system/delete-deploy.service` -> `/opt/zephyr/watcher/delete-deploy.service`
  - Get it running with `systemctl daemon-reload`
  - Get it running with `systemctl start create-deploy`
  - Get it running with `systemctl start delete-deploy`
  - Get it running with `systemctl enable create-deploy`
  - Get it running with `systemctl enable delete-deploy`
- There is a `git` user with a home directory
  - The `git` user has a `~/.config/systemd/user/` folder in it's home dir
  - The `git` user has read/write access to
    - `/opt/zephyr/watcher/ports`
    - `/opt/zephyr/watcher/repos`
  - There is a symlink from `/opt/zephyr/watcher/git-shell-commands` -> `/home/git/git-shell-commands`
    - The git user should have read access to the whole folder
  - The `git` user has passwordless sudo access to
    - systemctl
    - lsof

---

Optional setup:

- Deploy `https://github.com/hackclub/garden.zephyr`
- Deploy `https://github.com/hackclub/zephyr-hub` (rename to schedule.zephyr)
- Deploy `https://github.com/hackclub/the-zephyr-chronicles` (rename to chronicle.zephyr)
- Deploy start page (need to create & put at hackclub/start.zephyr)

- The `git` user should use the shell (`chsh -s $(command -v git-shell) git`)
  - Be aware this prevents ssh'ing in as the git user, which will make it harder to debug

## Teardown of a project
#!/bin/bash
inotifywait -e create -m -r /opt/zephyrnet --exclude '(node_modules/|.git/)' | while read dir action structure; do
    echo "inotifywait 'create' with arguments: $dir $action $structure"
    nohup sudo node /opt/zephyr/watcher/deploy.js $dir $action $structure &
done
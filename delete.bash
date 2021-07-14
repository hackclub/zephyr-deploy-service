#!/bin/bash
inotifywait -e delete,DELETE -m -r /opt/zephyrnet --exclude '(node_modules/|.git/)' | while read dir action structure; do
    echo "inotifywait 'deleted' with arguments: $dir $action $structure"
    sudo node /opt/zephyr/watcher/deleted.js $dir $action $structure
done
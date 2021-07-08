#!/usr/bin/env zsh


local script=$0:A
local scriptdir=`dirname $script`

echo 'SETTING UP TESTING FOR portly.zsh'; set -x

local testdir="$scriptdir"/test/portly

rm -rfv "$testdir"
mkdir -p "$testdir"/{test,z,yo,hi}.zephyr

ls -d test/portly/*.zephyr | xargs printf '%s/.env ' | xargs touch

for e in `ls "$testdir"/*.zephyr/.env`; do
	local port=$((1000 + RANDOM % 9999))
	echo 'PORT='"$port" >> "$e";
done


set +x; echo '!! DONE !! SET UP TESTING FOR portly.zsh in '"$testdir"

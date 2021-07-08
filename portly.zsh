#!/usr/bin/env zsh

local script=$0:A
local scriptdir=`dirname $script`
echo script $scriptdir scriptdir $scriptdir

local rootdir=${1:-$scriptdir/test/portly}
echo rootdir $rootdir

local testdir="$scriptdir"/test/portly

function get_reserved_ports() {
	grep -Po '.*PORT=\K(\d+)' "$testdir"/*.zephyr/.env | sed 's/:\([0-9]\+\)/\t\1/'
}

local reserved_ports=("${(@f)$(get_reserved_ports)}")

printf '%s\n' "${reserved_ports[@]}"


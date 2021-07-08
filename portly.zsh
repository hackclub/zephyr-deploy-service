#!/usr/bin/env zsh

local script=$0:A
local scriptdir=`dirname $script`
#echo script $scriptdir scriptdir $scriptdir

local rootdir=${1:-$scriptdir/test/portly}
#echo rootdir $rootdir

local testdir="$scriptdir"/test/portly
#echo testdir $testdir

function _get_reserved_ports() {
	grep -Po '.*PORT=\K(\d+)' "$testdir"/*.zephyr/.env | sed 's/:\([0-9]\+\)/\t\1/'
}

function get_reserved_ports() {
	local _reserved_ports=("${(@f)$(_get_reserved_ports)}")
	declare -A reserved_ports
	for line in ${_reserved_ports[@]}; do
		while IFS=$'\t' read -A resv_port; do
			reserved_ports[${resv_port[2]}]=${resv_port[1]:r:t}
		done < <(echo "$line")
	done
	for port domain in ${(kv)reserved_ports[@]}; do
		printf '%s %s\n' "$port" "$domain";
	done
}

get_reserved_ports

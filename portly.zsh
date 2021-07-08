#!/usr/bin/env zsh

local script=$0:A
local scriptdir=`dirname $script`
echo script $scriptdir scriptdir $scriptdir

local rootdir=${1:-$scriptdir/test/portly}
echo rootdir $rootdir

local testdir="$scriptdir"/test/portly

local reserved_ports=`grep -Po '.*PORT=\K(\d+)' "$testdir"/*.zephyr/.env | sed 's/:\([0-9]\+\)/\t\1/'`
echo reserved_ports $reserved_ports

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


declare -A RESERVED_PORTS
declare -A RESERVED_DOMAINS
function() { # IIFE - don't put code before this
	# query the filesystem and return a list like 'port domain' (no quotes, one per line)
	# also sets RESERVED_PORTS and RESERVED_DOMAINS
	local _reserved_ports=("${(@f)$(_get_reserved_ports)}")
	for line in ${_reserved_ports[@]}; do
		while IFS=$'\t' read -A resv_port; do
			RESERVED_PORTS[${resv_port[2]}]=${resv_port[1]:r:t}
			RESERVED_DOMAINS[${resv_port[1]:r:t}]=${resv_port[2]}
		done < <(echo "$line")
	done
}


function get_free_port() { # recursive
	local port="`shuf -i 1000-10000 -n 1`"
	if [[ -v RESERVED_PORTS[$port] ]]; then port=`get_free_port`; fi
	echo "$port"
}


function free_port() {
	# free up a port by deleting one from a .env in a *.zephyr folder
	local domain="$1"
	local port=$RESERVED_DOMAINS[$domain]
	#if [[ ! -v 1 ]] || [[ ! -v RESERVED_DOMAINS[$domain] ]]; then
	if [[ ! -v 1 ]] || [[ ! -d $testdir/$domain ]]; then
		>&2 echo 'pass a valid reserved domain (not "'"$1"'")' && exit -1;
	fi
	local envfile="$testdir"/"$domain"/.env
	sed -i '/^PORT=/ d' "$envfile"
	unset "RESERVED_PORTS[$port]"
	unset "RESERVED_DOMAINS[$domain]"
	write_portdb
}


function reserve_port() {
	# reserve a random port by adding one to a .env in a *.zephyr folder
	# deletes any existing port reservation
	local domain="$1"
	if [[ ! -v 1 ]] || [[ ! -d $testdir/$domain ]]; then
		>&2 echo 'pass a valid reserved domain (not "'"$1"'")' && exit -1;
	fi
	local envfile="$testdir"/"$domain"/.env
	free_port "$domain"
	local port=`get_free_port`
	echo 'PORT='"$port" >> "$envfile"
	RESERVED_PORTS[$port]=$domain
	RESERVED_DOMAINS[$domain]=$port
	write_portdb
}


# {{{ print functions
function print_ports_header() {
	local first="${1:-domain}"
	[[ "$first" == "port" ]] \
		&& echo PORT'\t'DOMAIN \
		|| echo DOMAIN'\t'PORT
}

function print_ports() {
	local first="${1:-domain}"
	local reservations;
	if [[ "$first" == "port" ]];
	then reservations=(${(kv)RESERVED_PORTS[@]});
	else reservations=(${(kv)RESERVED_DOMAINS[@]}); fi
	for port domain in ${(kv)reservations[@]}; do
		printf '%s\t%s\n' "$port" "$domain"
	done
}

function print_ports_full() {
 	(print_ports_header "$1"; print_ports)
}

function write_portdb() {
	print_ports_full "$1" > "$portdb"
}
# }}} print functions


# {{{ cli subcommands
local command="${1:-/dev/null}"

if [[ "$command" == "print" ]]; then
	print_ports_full "$2" | column -t

elif [[ "$command" == "writedb" ]]; then
	local portdb="$testdir"/ports.tsv
	echo "Writing ports to $portdb"
	write_portdb
	echo "Ports written to $portdb"

elif [[ "$command" == "free_port" ]]; then
	echo "freeing port for $2=$RESERVED_DOMAINS[$2]"
	free_port "$2"
	echo "freed port for $2"

elif [[ "$command" == "reserve_port" ]]; then
	echo "reserving port for $2"
	reserve_port "$2"
	echo "set port for $2=$RESERVED_DOMAINS[$2]"

else
	>&2 echo "no command selected (try 'print', 'writedb', 'reserve_port \$domain', 'free_port \$domain')"
fi
# }}} cli subcommands



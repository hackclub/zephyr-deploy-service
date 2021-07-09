#!/usr/bin/env zsh

local script=$0:A
local scriptdir=`dirname $script`
#echo script $scriptdir scriptdir $scriptdir

local testdir="$scriptdir"/test/portly
#echo testdir $testdir

#end_opts=$@[(i)(--|-)]
#set -- "${@[0,end_opts-1]}" "${@[end_opts+1,-1]}"

function print_help() {
	>&2 cat <<-EOF
portly.zsh:

	global flags:
		-r     reverse the port/domain columns in output
		--dir  operate on this root directory (should be /opt/zephyrnet)

	commands:
		--cmd print                   DOMAINS and PORTS in two columns
		--cmd writdb                  write a 'DOMAIN	PORT' file to "\$dir"/ports.tsv
		--cmd free orpheus.zephyr     free the port a reserved port
		--cmd reserve orpheus.zephyr  reserve a random port
EOF
}

declare -A misc
zparseopts -E -D -F \
    -dir:=o_dir \
    -cmd:=o_cmd \
    -domain:=o_domain \
    r=o_rev \
    || print_help

#echo "${o_dir[2]}"
#echo "${o_cmd[2]}"
#echo "${o_rev}"
#exit

local rootdir="${o_dir[2]:-$testdir}"

function _get_reserved_ports() {
	grep -Po '.*PORT=\K(\d+)' "$rootdir"/*.zephyr/.env | sed 's/:\([0-9]\+\)/\t\1/'
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
	local port="${RESERVED_DOMAINS[$domain]:-/dev/null}"
	#if [[ ! -v 1 ]] || [[ ! -v RESERVED_DOMAINS[$domain] ]]; then
	if [[ "$domain" == "" ]] || [[ ! -d $rootdir/$domain ]]; then
		>&2 echo 'pass a valid reserved domain (not "'"$1"'")' && exit -1;
	fi
	if [[ "$port" != "/dev/null" ]]; then
		local envfile="$rootdir"/"$domain"/.env
		sed -i '/^PORT=/ d' "$envfile"
		unset "RESERVED_PORTS[$port]"
		unset "RESERVED_DOMAINS[$domain]"
		write_portdb
	fi
}


function reserve_port() {
	# reserve a random port by adding one to a .env in a *.zephyr folder
	# deletes any existing port reservation
	local domain="$1"
	if [[ "$domain" == "" ]] || [[ ! -d $rootdir/$domain ]]; then
		>&2 echo 'pass a valid reserved domain (not "'"$1"'")' && exit -1;
	fi
	local envfile="$rootdir"/"$domain"/.env
	free_port "$domain"
	local port=`get_free_port`
	echo 'PORT='"$port" >> "$envfile"
	RESERVED_PORTS[$port]=$domain
	RESERVED_DOMAINS[$domain]=$port
	write_portdb
}


# {{{ print functions
function print_ports_header() {
	if [[ "$o_rev" == "-r" ]];
	then echo PORT'\t'DOMAIN
	else echo DOMAIN'\t'PORT; fi
}

function print_ports() {
	local reservations;
	if [[ "$o_rev" == "-r" ]];
	then reservations=(${(kv)RESERVED_PORTS[@]});
	else reservations=(${(kv)RESERVED_DOMAINS[@]}); fi
	for port domain in ${(kv)reservations[@]}; do
		printf '%s\t%s\n' "$port" "$domain"
	done
}

function print_ports_full() {
 	(print_ports_header; print_ports)
}

function write_portdb() {
	print_ports_full > "${2:-$rootdir/ports.tsv}"
}
# }}} print functions


# {{{ cli subcommands
local cmd="${o_cmd[2]:-/dev/null}"
local domain="${o_domain[2]:-/dev/null}"

if [[ "$cmd" == "print" ]]; then
	print_ports_full | column -t

elif [[ "$cmd" == "writedb" ]]; then
	local portdb="$rootdir"/ports.tsv
	echo "Writing ports to $portdb"
	write_portdb "$portdb"
	echo "Ports written to $portdb"

elif [[ "$cmd" == "free" ]]; then
	if [[ $domain == /dev/null ]]; then >&2 pass a valid domain; exit 1; fi
	echo "freeing port for $domain=${RESERVED_DOMAINS[$domain]:-NULL}"
	free_port "$domain"
	echo "freed port for $domain"

elif [[ "$cmd" == "reserve" ]]; then
	if [[ $domain == /dev/null ]]; then >&2 pass a valid domain; exit 1; fi
	echo "reserving port for $domain"
	reserve_port "$domain"
	echo "set port for $domain=${RESERVED_DOMAINS[$domain]:-NULL}"

elif [[ "$cmd" == "help" ]]; then
	print_help

else
	print_help

fi
# }}} cli subcommands



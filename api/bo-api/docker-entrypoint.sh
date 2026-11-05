#!/bin/sh

mongod --bind_ip 127.0.0.1 --dbpath /data/db &
mongo_pid=$!
api_pid=

shutdown() {
  kill "$mongo_pid" ${api_pid:+"$api_pid"} 2>/dev/null || true
}
trap shutdown INT TERM

until node -e "require('net').connect(27017, '127.0.0.1').on('connect', () => process.exit(0)).on('error', () => process.exit(1))"; do
  if ! kill -0 "$mongo_pid" 2>/dev/null; then
    wait "$mongo_pid"
    exit $?
  fi
  sleep 1
done

node dist/server.js &
api_pid=$!
if wait "$api_pid"; then
  status=0
else
  status=$?
fi

kill "$mongo_pid" 2>/dev/null || true
wait "$mongo_pid" 2>/dev/null || true
exit "$status"

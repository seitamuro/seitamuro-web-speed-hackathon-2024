#!/bin/bash
pid=$(ps aux | grep "pnpm" | grep -v grep | awk '{print $2}')
if [ ! -z "$pid" ]; then
  kill -9 $pid
fi
pid=$(lsof -i:8000 | awk '{print $2}')
if [ ! -z "$pid" ]; then
  kill -9 $pid
fi
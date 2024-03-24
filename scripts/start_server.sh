#!/bin/bash
cd /home/ec2-user
nohup sudo pnpm start > ./server.log 2>&1 &
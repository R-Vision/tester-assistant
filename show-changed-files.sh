#!/usr/bin/env bash

git fetch -q origin master
git diff --name-only origin/master

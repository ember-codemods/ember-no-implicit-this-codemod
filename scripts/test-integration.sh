#!/bin/bash

yarn ts-node ./test/run-test.ts

exit_code $?

git diff

exit $exit_code

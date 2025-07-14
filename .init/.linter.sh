#!/bin/bash
cd /home/kavia/workspace/code-generation/browser-tic-tac-toe-f454c873/react_js_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


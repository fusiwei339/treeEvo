#!/bin/bash
mongo --port 3001 meteor ../underscore.js dropRColl.js
Rscript regression.r
# mongo --port 3001 meteor ../underscore.js reformatR.js
# MediaEvalLeaderboard

[![Build Status](https://travis-ci.org/chauff/MediaEvalLeaderboard.svg?branch=master)](https://travis-ci.org/chauff/MediaEvalLeaderboard) [![Coverage Status](https://coveralls.io/repos/chauff/MediaEvalLeaderboard/badge.svg?branch=master)](https://coveralls.io/r/chauff/MediaEvalLeaderboard?branch=master)

Prototype leaderboard for the Placing Task at MediaEval 2015. 
This code was cobbled together over a few days (replicate at your own risk).

# Instructions 
Replace the `example-config.json` file with the actual login/password of an STMP-enabled email account. Create a folder `uploads` in which the files submitted to the leaderboard will be written to.

Start the application with `npm start`

Run the tests with `npm test`

In the data folder, the part of the test set used in MediaEval 2015 for the leaderboard computations are included.

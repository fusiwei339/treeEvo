# How to run it?
1. git clone the repo.

2. in the ./server/publication.js file, change '/Users/siweifu/project' in line 29 to the absolute path of this project in your computer.

3. go to the root folder of the project, run 'meteor' in the command line

4. copy malePeople.json file to ./public folder (if the data already exists, skip this step)

5. import tree.json to the database via 'mongoimport' command. Sample command is like: mongoimport --port 3001 -d meteor -c trees --file trees.json --jsonArray

6. in chrome, open http://localhost:3000


# Dependencies:
* data (malePeople.json, tree.json)

* python (with pymongo library)

* Node.js

* meteor.js

* mongodb


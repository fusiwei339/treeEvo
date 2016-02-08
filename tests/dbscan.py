import numpy as np
import collections 
from pymongo import MongoClient
from sklearn.cluster import DBSCAN, KMeans
from sklearn import metrics
from sklearn.datasets.samples_generator import make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn import preprocessing
from sklearn.metrics import silhouette_samples, silhouette_score


client = MongoClient('localhost', 3001)
db = client.meteor

# query={"nSon":{"$gt":0};
query = {}
nPeople=db.malePeople.find(query).count();

documents = np.zeros(shape=(nPeople,4));

for idx, doc in enumerate(db.malePeople.find(query)):
 	documents[idx][0]=doc[u'age']; 
 	documents[idx][1]=doc[u'hasSon']; 
 	documents[idx][2]=doc[u'hasMarriaged']; 
 	documents[idx][3]=doc[u'first_birth']; 
print documents

documents_scaled = preprocessing.normalize(documents, axis=0);

print documents_scaled


# ##############################################################################
nCluster=4;
print "start to cluster"
# for i in [3, 4, 5, 6, 7, 8, 9, 10]:
labels= KMeans(n_clusters=nCluster, random_state=10).fit_predict(documents_scaled)
# print "start to evaluate"

# silhouette_avg = silhouette_score(documents_scaled, labels)

print nCluster
# print silhouette_avg


# # Number of clusters in labels, ignoring noise if present.

count=0
for doc in db.malePeople.find(query):
    # doc[u"cluster"]=0;
    doc[u"cluster"]=labels[count].astype('str');
    db.malePeople.save(doc)
    count+=1

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
query = {"has_son":1}
nPeople=db.malePeople.find(query).count();

attrArr=[u'f_mar_age', u'SON_COUNT', u'lastage', u'f_bir_age', u'l_bir_age'];
documents = np.zeros(shape=(nPeople,len(attrArr)));

for idx, doc in enumerate(db.malePeople.find(query)):
	for attrIdx, attr in enumerate(attrArr):
		documents[idx][attrIdx]=doc[attr];

print documents

documents_scaled = preprocessing.normalize(documents, axis=0);

print documents_scaled


# ##############################################################################
nCluster=4;
print "start to cluster"

for i in [3, 4, 5, 6, 7, 8, 9, 10]:
	labels= KMeans(n_clusters=i, random_state=10).fit_predict(documents_scaled)
	print(i)
	silhouette_avg = silhouette_score(documents_scaled, labels)

# dbs = DBSCAN(eps=0.002, min_samples=5).fit(documents_scaled)
# labels=dbs.labels_
# n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
# print(n_clusters_)
# print(collections.Counter(labels))

	silhouette_avg = silhouette_score(documents_scaled, labels)
	print(silhouette_avg)


# # Number of clusters in labels, ignoring noise if present.

# print "start to insert"
# count=0
# for doc in db.malePeople.find(query):
#     # doc[u"cluster"]=0;
#     doc[u"cluster"]=labels[count].astype('str');
#     db.malePeople.save(doc)
#     count+=1

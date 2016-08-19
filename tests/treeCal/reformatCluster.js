var doc=db.clusters.findOne();
var arr=doc.data;

db.clusters.drop()
db.clusters.insert(arr)

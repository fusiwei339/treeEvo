
db.malePeople.update({SON_COUNT:0}, {$set:{cluster:'-1'}}, {multi:true})
db.malePeople.update({lastage:{$lt:15}}, {$set:{cluster:'0'}}, {multi:true})
db.malePeople.update({lastage:{$gte:15, $lt:35}}, {$set:{cluster:'1'}}, {multi:true})
db.malePeople.update({lastage:{$gte:35, $lt:55}}, {$set:{cluster:'2'}}, {multi:true})
db.malePeople.update({lastage:{$gte:55}}, {$set:{cluster:'3'}}, {multi:true})




db.sankeyNodes.update({cluster:'-2'},{$set:{vertiSort:0, color:'#fb8072', shadeColor:'#c7190a'}}, {multi:true})
db.sankeyNodes.update({cluster:'-1'},{$set:{vertiSort:1, color:'#fccde5', shadeColor:'#e40e7b'}}, {multi:true})
db.sankeyNodes.update({cluster:'1'},{$set:{vertiSort:4, color:'#b3de69', shadeColor:'#6f9b22'}}, {multi:true})
db.sankeyNodes.update({cluster:'0'},{$set:{vertiSort:5, color:'#8dd3c7', shadeColor:'#3c9b8b'}}, {multi:true})
db.sankeyNodes.update({cluster:'2'},{$set:{vertiSort:3, color:'#fdb462', shadeColor:'#d37103'}}, {multi:true})
db.sankeyNodes.update({cluster:'3'},{$set:{vertiSort:2, color:'#bebada', shadeColor:'#6056a1'}}, {multi:true})
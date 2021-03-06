library("RMongo")
library("effects")
library("nnet")
library("jsonlite")

json_oneAttr<-function(str, ml){
  effect_model<-effect(str, ml, xlevels=70)
  effect_model_obj=c()
  effect_model_obj$attr=str
  effect_model_obj$prob=effect_model$prob
  effect_model_obj$x=effect_model$x
  effect_model_obj$probLower=effect_model$lower.prob
  effect_model_obj$probUpper=effect_model$upper.prob
  effect_model_obj$ylevel=effect_model$y.levels
  
  nLevel=length(ml$lev);
  margin <- vector("list",nLevel)
  for (group in seq(1, nLevel, by=1)) {
    margin[[group]]= c(diff(effect_model$prob[,group]) / diff(effect_model$x[,1]))
  }
  effect_model_obj$margin=margin
  effect_model_json<-toJSON(effect_model_obj, force=TRUE)
  return(effect_model_json)
}
#start connecting db
mongo <- mongoDbConnect("meteor","localhost", 3001)

#modeling
data <- dbGetQuery(mongo, 'clusters', '{"birthyear":{"$lt":1860}}', 0, 0)

args <- commandArgs(TRUE)
i <- 1
str=paste('group ~ ',args[1], sep = '')
for (i in 2:length(args)) {
  str=paste(str, args[i], sep = "+")
}
print(str)
ml <- multinom(as.formula(str), data = data)

#post processing
attrs=args
for (attr in attrs) {
  ret<-json_oneAttr(attr,ml);
  dbInsertDocument(mongo, "r",toString(ret))
}

#disconnect db
dbDisconnect(mongo)



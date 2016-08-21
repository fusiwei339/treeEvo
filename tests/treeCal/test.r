args <- commandArgs(TRUE)
i <- 1
str=args[1]
for (i in 2:length(args)) {
  str=paste(str, args[i], sep = "+")
}
print(as.formula(str))
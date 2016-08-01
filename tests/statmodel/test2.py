import statsmodels.api as st

iris = st.datasets.get_rdataset('iris', 'datasets')
y = iris.data.Species
print y
x = iris.data.ix[:, 0]
x = st.add_constant(x, prepend = False)
print x

mdl = st.MNLogit(y, x)
mdl_fit = mdl.fit()
print mdl_fit.summary()

mdl_margeff = mdl_fit.get_margeff()
print mdl_margeff.summary()
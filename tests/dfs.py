import numpy as np

def dfs(i, s):
  if i == n:
    lst.append(s)
    return
  for j in range(m):
    dfs(i + 1, s * A[i][j])
    
n = 2
m = 4
A = np.arange(n * m).reshape(n, m)
print A

lst = []
dfs(0, 1)
print lst

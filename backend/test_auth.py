from fastapi.security import HTTPBearer
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()
security = HTTPBearer()

@app.get('/')
def read_root(token = Depends(security)):
    return 'ok'

client = TestClient(app)
res = client.get('/')
print(res.status_code)
print(res.json())

import os
import requests
from typing import List, Dict
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel
from jose import jwt, jwk
from jose.exceptions import JWTError

load_dotenv()

TENANT_ID = os.environ.get("TENANT_ID")
APP_CLIENT_ID = os.environ.get("APP_CLIENT_ID")
AZURE_AD_ISSUER = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
AZURE_AD_JWKS_URI = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

jwks_cache = {}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2AuthorizationCodeBearer(authorizationUrl="", tokenUrl="")
class User(BaseModel):
    name: str
    roles: List[str]
    tid: str

def get_jwks() -> Dict:    
    if not jwks_cache.get("keys"):
        print("Fetching new JWKS keys from Azure AD...")
        response = requests.get(AZURE_AD_JWKS_URI)
        response.raise_for_status()
        jwks_cache["keys"] = response.json()["keys"]
    return jwks_cache["keys"]

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict:    
    credentials_exception = HTTPException(
        status_code=401,
        detail="Unable to validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
            
        if not rsa_key:
            raise credentials_exception

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=APP_CLIENT_ID,
            issuer=AZURE_AD_ISSUER
        )
        return payload

    except JWTError as e:
        print(f"JWT error: {e}")
        raise credentials_exception

def require_role(required_role: str):
    async def role_checker(user: dict = Depends(get_current_user)):
        user_roles = user.get("roles", [])
        if required_role not in user_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Requires Role '{required_role}'"
            )
        return user
    return role_checker

@app.get("/")
async def root():
    return {"message": "Public API accessible by everyone."}

@app.get("/api/me", response_model=User)
async def get_my_info(user: dict = Depends(get_current_user)):
    return User(
        name=user.get("name", "Name not found"),
        roles=user.get("roles", []),
        tid=user.get("tid", "")
    )

@app.get("/api/admin")
async def get_admin_data(user: dict = Security(require_role("Admin"))):
    return {
        "message": f"Hello, administrator {user.get('name')}! You have access to restricted data."
    }
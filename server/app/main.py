from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, categories, orders, products, users, wishlist

app = FastAPI(title="KaliSoft AI Marketplace API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(wishlist.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}

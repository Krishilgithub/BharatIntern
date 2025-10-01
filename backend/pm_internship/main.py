from fastapi import FastAPI
from routers import resume, recommendations, applications, company, admin
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PM Internship AI Engine", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(recommendations.router)
app.include_router(applications.router)
app.include_router(company.router)
app.include_router(admin.router)

@app.get("/health")
def health():
    return {"status": "ok"}

from fastapi import FastAPI

app = FastAPI(
    title="Moacir Tech Hub - AI Service",
    description="Agente de IA e processamento de dados do portfólio",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "AI Service operando com sucesso!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="Moacir Tech Hub - AI Service",
    description="Agente de IA do portfólio"
)

class ProjectRequest(BaseModel):
    title: str
    techStack: List[str]

@app.get("/")
def read_root():
    return {"status": "online", "message": "AI Service operando com sucesso!"}

@app.post("/generate-summary")
def generate_summary(data: ProjectRequest):
    # Simulando a inteligência da IA gerando um resumo técnico de nível corporativo
    techs_str = ", ".join(data.techStack)
    smart_description = (
        f"Arquitetura de alta performance para o projeto '{data.title}', "
        f"desenvolvida utilizando o ecossistema moderno de {techs_str}. "
        f"Foco em microsserviços, resiliência e boas práticas de Clean Architecture."
    )
    
    return {"description": smart_description}

@app.post("/chat")
def chat_with_moa(data: dict):
    user_message = data.get("message", "").lower()
    
    # Resposta inteligente baseada no perfil e stack do Moa Hub
    if "microsserviço" in user_message or "arquitetura" in user_message:
        reply = "O Moa Hub utiliza uma arquitetura de microsserviços desacoplada: API Core em Node.js (Express/Prisma), microsserviço de IA em Python (FastAPI), mensageria assíncrona com RabbitMQ e persistência em PostgreSQL."
    elif "experiência" in user_message or "tecnologia" in user_message or "stack" in user_message:
        reply = "O ecossistema é construído com TypeScript, Node.js, Python, FastAPI, Docker, RabbitMQ, PostgreSQL e React com Tailwind CSS no frontend."
    else:
        reply = f"Compreendi a sua questão sobre '{user_message}'. Como IA do Moa Hub, garanto que esta plataforma foi desenhada para alta performance, resiliência e escalabilidade corporativa!"
        
    return {"reply": reply}
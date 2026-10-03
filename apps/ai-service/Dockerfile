FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema necessárias para compilar bibliotecas (como psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código para dentro do container
COPY . .

# Expor a porta que o FastAPI vai rodar
EXPOSE 8000

# Comando de inicialização
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
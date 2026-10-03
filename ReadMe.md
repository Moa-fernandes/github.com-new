# Moa Hub - Enterprise Command Center

[Read in English](#english-version)

O Moa Hub é uma plataforma de Command Center voltada para arquiteturas de microsserviços e integração com Inteligência Artificial. Este projeto serve como um portfólio técnico, demonstrando a implementação de padrões arquiteturais modernos, telemetria em tempo real, mensageria assíncrona e RAG (Retrieval-Augmented Generation) injetando estado na IA.

## Arquitetura e Tecnologias

A aplicação foi desenvolvida utilizando uma abordagem de microsserviços:

* Frontend: React, TypeScript, Tailwind CSS, Recharts (para telemetria de CPU/RAM em tempo real).
* API Core (Backend): Node.js, Express, TypeScript.
* Banco de Dados: PostgreSQL gerenciado via Prisma ORM.
* Mensageria: RabbitMQ para processamento de filas de tarefas assíncronas.
* Inteligência Artificial: Integração com a API do Google Gemini (RAG) injetando métricas do sistema no contexto do LLM.

## Funcionalidades Principais

1. Dashboard de Telemetria: Visualização do estado do cluster simulado (uso de CPU, alocação de memória do banco e requisições por segundo).
2. Assistente IA com Contexto: Chatbot integrado que atua como Arquiteto de Software, lendo as métricas do painel em tempo real para tomar decisões e responder perguntas do usuário.
3. Fila de Mensageria: Interface para simular publicação e consumo de mensagens em filas assíncronas do RabbitMQ.
4. Síntese de Projetos: Cadastro de arquiteturas onde um microsserviço analisa a stack fornecida e gera documentações automatizadas no banco de dados.

## Como Executar Localmente

1. Clone este repositório.
2. Crie um arquivo .env na raiz com a sua GEMINI_API_KEY e DATABASE_URL.
3. Instale as dependências com o comando: npm install
4. Execute as migrations do banco de dados: npx prisma db push
5. Inicie a aplicação com o comando: npm run dev

---

<a name="english-version"></a>
# Moa Hub - Enterprise Command Center

Moa Hub is a Command Center platform focused on microservices architectures and Artificial Intelligence integration. This project serves as a technical portfolio, demonstrating the implementation of modern architectural patterns, real-time telemetry, asynchronous messaging, and RAG (Retrieval-Augmented Generation) by injecting state into the AI.

## Architecture and Technologies

The application was developed using a microservices approach:

* Frontend: React, TypeScript, Tailwind CSS, Recharts (for real-time CPU/RAM telemetry).
* API Core (Backend): Node.js, Express, TypeScript.
* Database: PostgreSQL managed via Prisma ORM.
* Messaging: RabbitMQ for processing asynchronous task queues.
* Artificial Intelligence: Integration with Google Gemini API (RAG) injecting system metrics into the LLM context.

## Core Features

1. Telemetry Dashboard: Visualization of the simulated cluster state (CPU usage, database memory allocation, and requests per second).
2. Context-Aware AI Assistant: Integrated chatbot acting as a Software Architect, reading dashboard metrics in real-time to make decisions and answer user queries.
3. Message Queue: Interface to simulate publishing and consuming messages in asynchronous RabbitMQ queues.
4. Project Synthesis: Architecture registration where a microservice analyzes the provided stack and generates automated documentation in the database.

## How to Run Locally

1. Clone this repository.
2. Create a .env file in the root with your GEMINI_API_KEY and DATABASE_URL.
3. Install dependencies by running: npm install
4. Run database migrations: npx prisma db push
5. Start the application by running: npm run dev
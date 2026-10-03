import pika
import json
import time
import os

# Pega o host do RabbitMQ (no Docker, o nome do container é 'rabbitmq')
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")

def callback(ch, method, properties, body):
    data = json.loads(body)
    print(f" [📥] IA recebeu tarefa da fila: {data['prompt']}")
    
    # Simula um processamento pesado de IA (ex: análise de dados)
    time.sleep(2)
    
    print(f" [✅] Tarefa processada com sucesso pela IA!")
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consumer():
    while True:
        try:
            print(" [*] Conectando ao RabbitMQ para consumir filas...")
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
            channel = connection.channel()
            
            channel.queue_declare(queue='ai_tasks_queue', durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue='ai_tasks_queue', on_message_callback=callback)

            print(" [*] IA aguardando mensagens na fila. Para sair pressione CTRL+C")
            channel.start_consuming()
        except Exception as e:
            print(f" [!] Conexão falhou ({e}), tentando novamente em 5 segundos...")
            time.sleep(5)

if __name__ == "__main__":
    start_consumer()
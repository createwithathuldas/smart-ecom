from flask import Flask, request, jsonify
import mysql.connector
import pika
import requests
import json
import os

app = Flask(__name__)

def get_db():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "mysql-db"),
        user="root",
        password="root123",
        database="ecommerce"
    )

def publish_to_rabbitmq(message):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbitmq')
        )
        channel = connection.channel()
        channel.queue_declare(queue='payment_processed')
        channel.basic_publish(
            exchange='',
            routing_key='payment_processed',
            body=json.dumps(message)
        )
        connection.close()
        return True
    except Exception as e:
        print(f"RabbitMQ error: {e}")
        return False

# POST - Process payment
@app.route('/payment', methods=['POST'])
def process_payment():
    data = request.json
    product_id = data['product_id']
    quantity = data.get('quantity', 1)
    discount_code = data.get('discount_code', None)

    # Get product from inventory
    inv_response = requests.get(f"http://inventory:5001/inventory/{product_id}")
    if inv_response.status_code != 200:
        return jsonify({"error": "Product not found"}), 404

    product = inv_response.json()
    original_price = float(product['price']) * quantity
    discount_amount = 0
    final_amount = original_price

    # Apply discount if code provided
    if discount_code:
        disc_response = requests.post(
            "http://discount:5003/discount",
            json={"code": discount_code, "original_price": original_price}
        )
        disc_data = disc_response.json()
        discount_amount = disc_data.get('discount_amount', 0)
        final_amount = disc_data.get('final_price', original_price)

    # Save payment to DB
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """INSERT INTO payments 
        (product_id, product_name, quantity, original_price, discount_applied, final_amount, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (product_id, product['name'], quantity, original_price, discount_amount, final_amount, 'success')
    )
    db.commit()

    # Update inventory
    requests.put(
        f"http://inventory:5001/inventory/{product_id}",
        json={"quantity": quantity}
    )

    # Publish to RabbitMQ
    message = {
        "product_id": product_id,
        "product_name": product['name'],
        "quantity": quantity,
        "original_price": original_price,
        "discount_applied": discount_amount,
        "final_amount": final_amount,
        "status": "success"
    }
    publish_to_rabbitmq(message)

    return jsonify({
        "message": "Payment successful",
        "product": product['name'],
        "quantity": quantity,
        "original_price": original_price,
        "discount_applied": discount_amount,
        "final_amount": final_amount,
        "status": "success"
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)

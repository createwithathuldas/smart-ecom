from flask import Flask, request, jsonify
import mysql.connector
import os

app = Flask(__name__)

def get_db():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "mysql-db"),
        user="root",
        password="root123",
        database="ecommerce"
    )

# POST - Add item to cart
@app.route('/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Check inventory first
    cursor.execute("SELECT * FROM inventory WHERE id = %s", (data['product_id'],))
    item = cursor.fetchone()

    if not item:
        return jsonify({"error": "Product not found"}), 404
    if item['quantity'] < data['quantity']:
        return jsonify({"error": "Insufficient stock"}), 400

    # Add to cart
    cursor.execute(
        "INSERT INTO cart (product_id, product_name, quantity, price) VALUES (%s, %s, %s, %s)",
        (item['id'], item['name'], data['quantity'], item['price'])
    )
    db.commit()

    return jsonify({
        "message": "Item added to cart",
        "product": item['name'],
        "quantity": data['quantity'],
        "price": float(item['price'])
    }), 201

# GET - View cart
@app.route('/cart', methods=['GET'])
def view_cart():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cart")
    items = cursor.fetchall()

    total = sum(float(i['price']) * i['quantity'] for i in items)

    return jsonify({
        "cart_items": items,
        "total": total
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

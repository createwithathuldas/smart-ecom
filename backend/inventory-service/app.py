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

# POST - Add new inventory item
@app.route('/inventory', methods=['POST'])
def add_item():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO inventory (name, price, quantity) VALUES (%s, %s, %s)",
        (data['name'], data['price'], data['quantity'])
    )
    db.commit()
    return jsonify({"message": "Item added", "id": cursor.lastrowid}), 201

# GET - Get specific item
@app.route('/inventory/<int:item_id>', methods=['GET'])
def get_item(item_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM inventory WHERE id = %s", (item_id,))
    item = cursor.fetchone()
    if not item:
        return jsonify({"error": "Item not found"}), 404
    return jsonify(item)

# GET ALL - Get all items
@app.route('/inventory', methods=['GET'])
def get_all_items():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM inventory")
    items = cursor.fetchall()
    return jsonify(items)

# PUT - Update quantity after purchase
@app.route('/inventory/<int:item_id>', methods=['PUT'])
def update_quantity(item_id):
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE inventory SET quantity = quantity - %s WHERE id = %s AND quantity >= %s",
        (data['quantity'], item_id, data['quantity'])
    )
    db.commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "Insufficient stock or item not found"}), 400
    return jsonify({"message": "Inventory updated successfully"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

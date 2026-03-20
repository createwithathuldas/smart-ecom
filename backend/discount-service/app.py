from flask import Flask, request, jsonify

app = Flask(__name__)

# Available discount codes
DISCOUNT_CODES = {
    "NEWYEAR": 10,   # 10% off
    "SAVE20": 20,    # 20% off
    "FLAT50": 50,    # 50% off
}

# POST - Apply discount
@app.route('/discount', methods=['POST'])
def apply_discount():
    data = request.json
    code = data.get('code', '').upper()
    original_price = data.get('original_price', 0)

    if code not in DISCOUNT_CODES:
        return jsonify({
            "message": "Invalid discount code",
            "original_price": original_price,
            "discount_percent": 0,
            "discount_amount": 0,
            "final_price": original_price
        }), 200

    discount_percent = DISCOUNT_CODES[code]
    discount_amount = (original_price * discount_percent) / 100
    final_price = original_price - discount_amount

    return jsonify({
        "message": f"Discount applied successfully",
        "code": code,
        "original_price": original_price,
        "discount_percent": discount_percent,
        "discount_amount": discount_amount,
        "final_price": final_price
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)

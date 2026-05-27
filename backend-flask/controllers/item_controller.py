from flask import request, jsonify
from models.item import ItemModel


def get_all_items():
    items = ItemModel.get_all()
    return jsonify(items), 200


def get_item(item_id):
    item = ItemModel.get_by_id(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    return jsonify(item), 200


def create_item():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "name is required"}), 400
    item_id = ItemModel.create(data["name"], data.get("description", ""))
    return jsonify({"id": item_id, "name": data["name"], "description": data.get("description", "")}), 201


def update_item(item_id):
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "name is required"}), 400
    affected = ItemModel.update(item_id, data["name"], data.get("description", ""))
    if not affected:
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"id": item_id, "name": data["name"], "description": data.get("description", "")}), 200


def delete_item(item_id):
    affected = ItemModel.delete(item_id)
    if not affected:
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"message": "Item deleted"}), 200

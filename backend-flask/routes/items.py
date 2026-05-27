from flask import Blueprint
from controllers.item_controller import (
    get_all_items,
    get_item,
    create_item,
    update_item,
    delete_item,
)

bp = Blueprint("items", __name__)

bp.route("/api/items", methods=["GET"])(get_all_items)
bp.route("/api/items/<int:item_id>", methods=["GET"])(get_item)
bp.route("/api/items", methods=["POST"])(create_item)
bp.route("/api/items/<int:item_id>", methods=["PUT"])(update_item)
bp.route("/api/items/<int:item_id>", methods=["DELETE"])(delete_item)

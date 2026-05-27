from config.db import get_db


class ItemModel:
    @staticmethod
    def get_all():
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM items ORDER BY created_at DESC")
        rows = cursor.fetchall()
        cursor.close()
        db.close()
        return rows

    @staticmethod
    def get_by_id(item_id):
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM items WHERE id = %s", (item_id,))
        row = cursor.fetchone()
        cursor.close()
        db.close()
        return row

    @staticmethod
    def create(name, description):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO items (name, description) VALUES (%s, %s)",
            (name, description)
        )
        db.commit()
        item_id = cursor.lastrowid
        cursor.close()
        db.close()
        return item_id

    @staticmethod
    def update(item_id, name, description):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE items SET name = %s, description = %s WHERE id = %s",
            (name, description, item_id)
        )
        db.commit()
        affected = cursor.rowcount
        cursor.close()
        db.close()
        return affected

    @staticmethod
    def delete(item_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM items WHERE id = %s", (item_id,))
        db.commit()
        affected = cursor.rowcount
        cursor.close()
        db.close()
        return affected

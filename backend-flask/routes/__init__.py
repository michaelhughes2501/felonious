from .items import bp as items_bp


def register_routes(app):
    app.register_blueprint(items_bp)

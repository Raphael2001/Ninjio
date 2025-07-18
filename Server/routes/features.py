from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Feature, Upvote, db
from . import bp

@bp.route("/features", methods=["GET"])
def list_features():
    features = Feature.query.order_by(Feature.upvotes.desc()).all()
    return jsonify([{
        "id": f.id,
        "title": f.title,
        "description": f.description,
        "upvotes": f.upvotes
    } for f in features])

@bp.route("/features", methods=["POST"])
@jwt_required()
def create_feature():
    user_id = get_jwt_identity()
    data = request.json
    feature = Feature(user_id=user_id, title=data["title"], description=data["description"])
    db.session.add(feature)
    db.session.commit()
    return jsonify({"id": feature.id}), 201

@bp.route("/features/<int:feature_id>/upvote", methods=["POST"])
@jwt_required()
def upvote_feature(feature_id):
    user_id = get_jwt_identity()
    # Check if this user already upvoted this feature
    existing = Upvote.query.filter_by(user_id=user_id, feature_id=feature_id).first()
    if existing:
        return jsonify({"error": "You already upvoted this feature."}), 400

    # Otherwise, add the upvote
    upvote = Upvote(user_id=user_id, feature_id=feature_id)
    feature = Feature.query.get_or_404(feature_id)
    feature.upvotes += 1
    db.session.add(upvote)
    db.session.commit()
    return jsonify({"message": "Upvoted"}), 200

"""
/alerts routes — manage and retrieve pollution alerts.
"""
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from ..db.mongodb import get_db

router = APIRouter()


@router.get("/")
async def get_alerts(
    city:   str = Query(None),
    level:  str = Query(None),
    limit:  int = Query(50, le=200),
    hours:  int = Query(24),
):
    """Retrieve recent alerts, optionally filtered by city/level."""
    db = await get_db()
    query = {"timestamp": {"$gte": datetime.utcnow() - timedelta(hours=hours)}}
    if city:  query["city"]  = city
    if level: query["level"] = level

    cursor = db.alerts.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
    docs = await cursor.to_list(limit)
    return {"status": "ok", "count": len(docs), "alerts": docs}


@router.get("/stats")
async def alert_stats():
    """Summary counts of alerts by level for the last 24 hours."""
    db = await get_db()
    since = datetime.utcnow() - timedelta(hours=24)
    pipeline = [
        {"$match": {"timestamp": {"$gte": since}}},
        {"$group": {"_id": "$level", "count": {"$sum": 1}}},
    ]
    cursor = db.alerts.aggregate(pipeline)
    results = await cursor.to_list(100)
    stats = {r["_id"]: r["count"] for r in results}
    return {
        "critical": stats.get("critical", 0),
        "warning":  stats.get("warning", 0),
        "info":     stats.get("info", 0),
        "total":    sum(stats.values()),
    }


@router.delete("/clear")
async def clear_alerts(city: str = Query(None)):
    """Clear alerts (admin only in production — add auth middleware)."""
    db = await get_db()
    query = {"city": city} if city else {}
    result = await db.alerts.delete_many(query)
    return {"deleted": result.deleted_count}

from app import db
from datetime import datetime

class Lead(db.Model):
    __tablename__ = 'leads'
    
    id = db.Column(db.Integer, primary_key=True)
    gmail = db.Column(db.String(120), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<Lead {self.gmail}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'gmail': self.gmail,
            'timestamp': self.timestamp.isoformat()
        }

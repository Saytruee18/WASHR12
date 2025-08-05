from flask import render_template, request, jsonify, redirect, url_for, flash
from app import app, db
from models import Lead
import logging

@app.route('/')
def index():
    """Main landing page"""
    return render_template('index.html')

@app.route('/capture_lead', methods=['POST'])
def capture_lead():
    """Capture email lead and redirect to Gumroad"""
    try:
        gmail = request.form.get('gmail', '').strip()
        
        # If email is provided, save it
        if gmail:
            # Validate email format
            if '@gmail.com' not in gmail.lower():
                flash('Please enter a valid Gmail address', 'error')
                return redirect(url_for('index'))
            
            # Check if email already exists
            existing_lead = Lead.query.filter_by(gmail=gmail).first()
            if not existing_lead:
                new_lead = Lead(gmail=gmail)
                db.session.add(new_lead)
                db.session.commit()
                logging.info(f"New lead captured: {gmail}")
            else:
                logging.info(f"Existing lead attempted: {gmail}")
        
        # Return success response for AJAX
        if request.headers.get('Content-Type') == 'application/json':
            return jsonify({'success': True, 'message': 'Lead captured successfully'})
        
        # For form submission, redirect back to index
        return redirect(url_for('index'))
        
    except Exception as e:
        logging.error(f"Error capturing lead: {str(e)}")
        if request.headers.get('Content-Type') == 'application/json':
            return jsonify({'success': False, 'error': str(e)}), 500
        flash('An error occurred. Please try again.', 'error')
        return redirect(url_for('index'))

@app.route('/admin/leads')
def admin_leads():
    """Admin endpoint to view all leads (for debugging/export)"""
    leads = Lead.query.order_by(Lead.timestamp.desc()).all()
    return jsonify([lead.to_dict() for lead in leads])

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': str(db.func.now())})

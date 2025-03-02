// client/src/components/inspections/InspectionForm.js
import React from 'react';
import { Link } from 'react-router-dom';

const InspectionForm = () => {
  return (
    <div className="inspection-form-container">
      <h1>Record Inspection</h1>
      <p>This feature is under development.</p>
      <Link to="/inspections" className="btn btn-secondary">
        Back to Inspections
      </Link>
    </div>
  );
};

export default InspectionForm;
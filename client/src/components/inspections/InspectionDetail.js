// client/src/components/inspections/InspectionDetail.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const InspectionDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="inspection-detail-container">
      <h1>Inspection Details</h1>
      <p>Viewing inspection ID: {id}</p>
      <p>This feature is under development.</p>
      <Link to="/inspections" className="btn btn-secondary">
        Back to Inspections
      </Link>
    </div>
  );
};

export default InspectionDetail;
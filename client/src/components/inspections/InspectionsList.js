// client/src/components/inspections/InspectionsList.js
import React from 'react';
import { Link } from 'react-router-dom';

const InspectionsList = () => {
  return (
    <div className="inspections-container">
      <h1>Inspections</h1>
      <p>This feature is under development.</p>
      <Link to="/inspections/new" className="btn btn-primary">
        Record New Inspection
      </Link>
    </div>
  );
};

export default InspectionsList;
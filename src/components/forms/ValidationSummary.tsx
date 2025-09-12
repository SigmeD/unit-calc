import React from 'react';
import Card from '../ui/Card';

interface ValidationSummaryProps {
  errors: Record<string, string>;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ errors }) => {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <Card title="Ошибки валидации" className="border-red-200 bg-red-50">
      <div className="space-y-2">
        {errorEntries.map(([field, message]) => (
          <div key={field} className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-red-700">
                <span className="font-medium">{field}:</span> {message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ValidationSummary;
import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  onClose 
}) => {
  const styles = {
    error: {
      backgroundColor: '#ffebee',
      color: '#d32f2f',
      border: '1px solid #d32f2f'
    },
    warning: {
      backgroundColor: '#fff3e0',
      color: '#f57c00',
      border: '1px solid #f57c00'
    },
    info: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      border: '1px solid #1976d2'
    },
    success: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
      border: '1px solid #2e7d32'
    }
  };

  return (
    <div 
      style={{
        ...styles[type],
        padding: '10px',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 0'
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  onClose: PropTypes.func
};

export default ErrorMessage;

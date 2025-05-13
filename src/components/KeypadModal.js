import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackspace, faTimes } from '@fortawesome/free-solid-svg-icons';
import NumberPad from './NumberPad'; // Import NumberPad if available in the project

/**
 * KeypadModal - A reusable three-column modal component for numeric input
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Content to display in the middle column
 * @param {boolean} props.showNumberPad - Whether to show the number pad in the left column (default: true)
 * @param {string} props.numberPadValue - Current value for the number pad
 * @param {function} props.onNumberPadChange - Function to call when number pad value changes
 * @param {function} props.onNumberPadConfirm - Function to call when number pad confirm button is clicked
 * @param {boolean} props.showQuickAmounts - Whether to show quick amount buttons in the right column (default: true)
 * @param {function} props.onQuickAmountClick - Function to call when a quick amount button is clicked
 * @param {string} props.width - Modal width (default: "80%")
 * @param {React.ReactNode} props.headerContent - Additional content to show in the modal header
 * @param {boolean} props.showCloseButton - Whether to show the close button (default: false)
 * @param {string} props.activeInputType - Current active input type
 * @returns {React.ReactElement}
 */
function KeypadModal({
  isOpen,
  onClose,
  title = '',
  children,
  showNumberPad = true,
  numberPadValue = '',
  onNumberPadChange,
  onNumberPadConfirm,
  showQuickAmounts = true,
  onQuickAmountClick,
  width = '70%',
  headerContent,
  showCloseButton = false,
  activeInputType = 'main'
}) {
  // Check if current device is PC - moved before conditional return to follow React Hooks rules
  const [isPC, setIsPC] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsPC(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  // Default quick amounts to display
  const quickAmounts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  // Process number pad input changes
  const handleNumberPadChange = (newValue) => {
    // Pass original value to parent component
    // This keeps UI showing what user actually typed
    onNumberPadChange(newValue);
  };

  // Handle number pad confirmation
  const handleNumberPadConfirm = () => {
    // If input ends with decimal point, add 0 before confirming
    let valueToConfirm = numberPadValue;
    if (numberPadValue.endsWith('.')) {
      valueToConfirm = numberPadValue + '0';

      // Update parent component value first to ensure UI displays correctly
      onNumberPadChange(valueToConfirm);

      // Wait for DOM update before calling confirm function
      setTimeout(() => {
        onNumberPadConfirm();
      }, 100);
    } else {
      onNumberPadConfirm();
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog" role="document" style={{ maxWidth: 'fit-content', width: 'auto' }}>
        <div className="modal-content">
          <div className="modal-header">
            {title && <h5 className="modal-title">{title}</h5>}
            {headerContent}
            {showCloseButton && (
              <button 
                type="button" 
                className="close" 
                onClick={onClose} 
                aria-label="Close"
                style={{ 
                  marginLeft: 'auto',
                  border: 'none', 
                  background: 'transparent',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#000',
                  cursor: 'pointer'
                }}
                translate="no"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {/* Left column - Number Pad */}
              {showNumberPad && isPC && (
                <div style={{ width: '250px', marginRight: '10px' }}>
                  <NumberPad
                    key={activeInputType}
                    inputValue={numberPadValue}
                    onInputChange={handleNumberPadChange}
                    onConfirm={handleNumberPadConfirm}
                    onCancel={() => {}}
                    show={true}
                    embedded={true}
                  />
                </div>
              )}

              {/* Middle column - Content */}
              <div style={{ width: '500px' }}>
                {children}
              </div>

              {/* Right column - Quick Amounts */}
              {showQuickAmounts && isPC && (
                <div style={{ width: '150px', marginLeft: '10px' }}>
                  <div className="number-pad-right">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => onQuickAmountClick(amount)}
                        className="notranslate"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeypadModal;

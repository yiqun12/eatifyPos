import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './NumberPad.css'; // We'll create this CSS file later
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackspace } from '@fortawesome/free-solid-svg-icons';

const NumberPad = ({
  inputValue,
  onInputChange,
  onConfirm,
  onCancel,
  show,
  embedded = false // New property to control embedded mode
}) => {
  // Internal state to control display
  const [internalValue, setInternalValue] = useState(inputValue);

  // Sync with external input value changes
  useEffect(() => {
    setInternalValue(inputValue);
  }, [inputValue]);

  if (!show) {
    return null;
  }

  const updateValue = (newValue) => {
    // Validate input matches number format (allowing decimal point at end)
    if (/^-?\d*\.?\d*$/.test(newValue)) {
      setInternalValue(newValue);
      onInputChange(newValue);
    }
  };

  const handleNumberClick = (num) => {
    updateValue(internalValue + num.toString());
  };

  const handleDotClick = () => {
    if (!internalValue.includes('.')) {
      if (internalValue === '') {
        updateValue('0.');
      } else {
        updateValue(internalValue + '.');
      }
    }
  };

  const handleClearClick = () => {
    updateValue('');
  };

  const handleBackspaceClick = () => {
    if (internalValue.length > 0) {
      updateValue(internalValue.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    // 处理以小数点结尾的情况
    let valueToConfirm = internalValue;
    if (internalValue.endsWith('.')) {
      valueToConfirm = internalValue + '0';
      // 更新内部值和外部值
      setInternalValue(valueToConfirm);
      onInputChange(valueToConfirm);
    }
    // 传递处理后的值
    onConfirm(valueToConfirm);
  };

  // 数字键盘部分（左侧）
  const renderKeypad = () => (
    <div className="number-pad-left">
      {/* Display current input */}
      <div className="number-pad-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} onClick={() => handleNumberClick(num)}>
            {num}
          </button>
        ))}
        <button className='notranslate' onClick={handleDotClick}>.</button>
        <button onClick={() => handleNumberClick(0)}>0</button>
        <button onClick={() => updateValue(internalValue + '00')}>00</button>
      </div>
      <div className="number-pad-actions">
        <button onClick={handleClearClick} className="clear-button notranslate">C</button>
        <button onClick={handleBackspaceClick} className="backspace-button">
          <FontAwesomeIcon icon={faBackspace} />
        </button>
        {!embedded && (
          <button onClick={handleConfirm} className="confirm-button">Confirm</button>
        )}
      </div>
      {!embedded && (
        <div className="number-pad-actions" style={{ marginTop: '8px' }}>
          <button onClick={onCancel} className="cancel-button" style={{ gridColumn: 'span 3' }}>Cancel</button>
        </div>
      )}
    </div>
  );

  // 根据是否嵌入式返回不同的渲染结果
  if (embedded) {
    return (
      <>
        {renderKeypad()}
      </>
    );
  }

  // 非嵌入式时，显示浮动的数字键盘
  return (
    <div className="number-pad-overlay">
      <div className="number-pad-container">
        {renderKeypad()}
      </div>
    </div>
  );
};

NumberPad.propTypes = {
  inputValue: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  targetInputRef: PropTypes.object, // DOM ref of the input for positioning
  embedded: PropTypes.bool, // Whether in embedded mode
};

export default NumberPad;

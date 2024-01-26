import React from 'react';

// Components
import { Button, Range } from 'ui';

// Styles
import './LiquidityRange.scss';

// Main
function LiquidityRange({onChange, defaultValue}) {
  const [value, setValue] = React.useState(defaultValue * 100);

  // Handlers
  // Range change handler
  const handleChange = (newValue) => {
    setValue(newValue);
    onChange(newValue / 100);
  };

  return (
    <div className="LiquidityRange">
      <span className="default-text-light">Amount</span>
      <div>
        <span className="LiquidityRange__amount">{value}%</span>
      </div>
      <Range
        min={0}
        max={100}
        onChange={handleChange}
        value={value}
        skipLabel
        type="light-blue"
      />
      <div className="LiquidityRange__buttons">
        <Button type="secondary" onClick={() => handleChange(25)}>
          25%
        </Button>
        <Button type="secondary" onClick={() => handleChange(50)}>
          50%
        </Button>
        <Button type="secondary" onClick={() => handleChange(75)}>
          75%
        </Button>
        <Button type="secondary" onClick={() => handleChange(100)}>
          Max
        </Button>
      </div>
    </div>
  );
}

export default LiquidityRange;

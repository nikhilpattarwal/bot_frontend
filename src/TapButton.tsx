import React from 'react';

interface TapButtonProps {
  onClick: () => void;
}

const TapButton: React.FC<TapButtonProps> = ({ onClick }) => {
  return (
    <div onClick={onClick} className="tap-button">
      <img src='/images/robo.png' style={{height:'18rem', width:'18rem'}}/>
    </div>
  );
};

export default TapButton;

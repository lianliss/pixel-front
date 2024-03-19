import React from 'react';
import {default as ReactCountdown} from 'react-countdown';

const timeRenderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    return '';
  } else {
    // Render a countdown
    return <>
      {!!hours && `${hours.toString().padStart(2, '0')}:`}
      {minutes.toString().padStart(2, '0')}
      :{seconds.toString().padStart(2, '0')}</>;
  }
};

function Countdown({time, onComplete = () => {}}) {
  return <ReactCountdown renderer={timeRenderer}
                         onComplete={onComplete}
                         date={time} />
}

export default Countdown;

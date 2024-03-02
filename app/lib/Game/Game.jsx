import React from 'react';
import styles from './Game.module.scss';

function Game() {
  
  React.useEffect(() => {
    //window.GameMaker_Init();
  }, []);
  
  return <div className={styles.game}>
    <canvas id={'canvas'} width={480} height={360}>
      <p>Your browser doesn't support HTML5 canvas.</p>
    </canvas>
  </div>
}

export default Game;

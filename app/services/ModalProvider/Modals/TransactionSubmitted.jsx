import React from "react";
import {Button} from 'lib/ui';

function TransactionSubmitted({txLink, symbol, addToken}) {
  return <>
    <p>
      Transaction Submitted
    </p>
    <p>
      <a href={txLink}>See transaction</a>
    </p>
    <Button onClick={addToken}>
      Add {symbol} to wallet
    </Button>
  </>
}

export default TransactionSubmitted;

import { useContext } from 'react';
import Transaction from './Transaction';
import { TransactionContext } from '../contexts/TransactionContext';

function TransactionList() {
  const { transactions } = useContext(TransactionContext);
  return (
    <ul className="list-group">
      {transactions.map(el => (
        <Transaction key={el.id} transaction={el} />
      ))}
    </ul>
  );
}

export default TransactionList;

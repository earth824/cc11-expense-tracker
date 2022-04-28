import { useParams } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';

function TransactionAction() {
  const params = useParams();

  return <TransactionForm />;
}

export default TransactionAction;

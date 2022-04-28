import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import validator from 'validator';
import axios from 'axios';
import { TransactionContext } from '../contexts/TransactionContext';
import {
  DELETE_TRANSACTION,
  FETCH_TRANSACTION
} from '../reducers/transactionReducer';

const INCOME = 'INCOME';
const EXPENSE = 'EXPENSE';

function TransactionForm() {
  const [transaction, setTransaction] = useState({});
  const [notFoundError, setNotFoundError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categoryType, setCategoryType] = useState(EXPENSE);
  const [payeeInput, setPayeeInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [selectedCategoryId, setSelectedCategotyId] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  const [error, setError] = useState({});

  const { dispatch } = useContext(TransactionContext);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (params.transactionId) {
      axios
        .get('http://localhost:8080/transactions/' + params.transactionId)
        .then(res => {
          if (res.data.transaction === null) {
            setNotFoundError(true);
          } else {
            setTransaction(res.data.transaction);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [params.transactionId]);

  useEffect(() => {
    const fetchCategory = async () => {
      const res = await axios.get('http://localhost:8080/categories');
      const resultExpenses = res.data.categories.filter(
        el => el.type === EXPENSE
      );
      const resultIncomes = res.data.categories.filter(
        el => el.type === INCOME
      );
      setExpenses(resultExpenses);
      setIncomes(resultIncomes);
      if (categoryType === EXPENSE) {
        setSelectedCategotyId(resultExpenses[0].id);
      } else {
        setSelectedCategotyId(resultIncomes[0].id);
      }
    };
    fetchCategory();
  }, []);

  // useEffect(() => {
  //   setSelectedCategotyId(categoryType === EXPENSE ? expenses[0].id : incomes[0].id)
  // }, [categoryType])

  const handleSubmitForm = async event => {
    event.preventDefault();
    // validate input before request to server
    const inputError = {};

    if (validator.isEmpty(payeeInput)) {
      inputError.payee = 'Payee is required';
    }

    if (validator.isEmpty(amountInput)) {
      inputError.amount = 'Amount is required';
    } else if (!validator.isNumeric(amountInput)) {
      inputError.amount = 'Amount must be numeric';
    } else if (amountInput <= 0) {
      inputError.amount = 'Amount must be greater than zero';
    }

    if (validator.isEmpty(dateInput)) {
      inputError.date = 'Date is required';
    }

    if (Object.keys(inputError).length > 0) {
      setError(inputError);
    } else {
      setError({});
    }

    try {
      await axios.post('http://localhost:8080/transactions', {
        payee: payeeInput,
        categoryId: selectedCategoryId,
        amount: +amountInput,
        date: dateInput
      });
      const res = await axios.get('http://localhost:8080/transactions');
      dispatch({
        type: FETCH_TRANSACTION,
        value: { transactions: res.data.transactions }
      });
      navigate('/home');
    } catch (err) {
      console.log(err);
    }
  };

  const handleClickDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        'http://localhost:8080/transactions/' + params.transactionId
      );
      dispatch({
        type: DELETE_TRANSACTION,
        value: { id: params.transactionId }
      });
      setLoading(false);
      navigate('/home');
    } catch (err) {
      console.log(err);
    }
  };

  if (notFoundError)
    return <h1 className="text-white">404 !!! Transaction is not found</h1>;

  return (
    <>
      <div className="border bg-white rounded-2 p-3">
        <form className="row g-3" onSubmit={handleSubmitForm}>
          <div className="col-6">
            <input
              type="radio"
              className="btn-check"
              id="cbx-expense"
              name="type"
              defaultChecked
              onChange={() => {
                setCategoryType(EXPENSE);
                setSelectedCategotyId(expenses[0].id);
              }}
            />
            <label
              className="btn btn-outline-danger rounded-0 rounded-start"
              htmlFor="cbx-expense"
            >
              Expense
            </label>
            <input
              type="radio"
              className="btn-check"
              id="cbx-income"
              name="type"
              onChange={() => {
                setCategoryType(INCOME);
                setSelectedCategotyId(incomes[0].id);
              }}
            />
            <label
              className="btn btn-outline-success rounded-0 rounded-end"
              htmlFor="cbx-income"
            >
              Income
            </label>
          </div>

          <div className="col-6 d-flex justify-content-end">
            <i className="fa-solid fa-xmark" role="button" />
          </div>

          <div className="col-sm-6">
            <label className="form-label">Payee</label>
            <input
              className={`form-control ${error.payee ? 'is-invalid' : ''}`}
              type="text"
              value={payeeInput}
              onChange={event => setPayeeInput(event.target.value)}
            />
            {error.payee && (
              <div className="invalid-feedback">{error.payee}</div>
            )}
          </div>

          <div className="col-sm-6">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={selectedCategoryId}
              onChange={event => setSelectedCategotyId(event.target.value)}
            >
              {(categoryType === EXPENSE ? expenses : incomes).map(el => (
                <option key={el.id} value={el.id}>
                  {el.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6">
            <label className="form-label">Amount</label>
            <input
              className={`form-control ${error.amount ? 'is-invalid' : ''}`}
              type="text"
              value={amountInput}
              onChange={event => setAmountInput(event.target.value)}
            />
            {error.amount && (
              <div className="invalid-feedback">{error.amount}</div>
            )}
          </div>

          <div className="col-sm-6">
            <label className="form-label">Date</label>
            <input
              className={`form-control ${error.date ? 'is-invalid' : ''}`}
              type="date"
              value={dateInput}
              onChange={event => setDateInput(event.target.value)}
            />
            {error.date && <div className="invalid-feedback">{error.date}</div>}
          </div>

          <div className="col-12">
            <div className="d-grid mt-3">
              <button className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
      {params.transactionId && (
        <div className="d-grid mt-5">
          <button
            className="btn btn-danger"
            onClick={handleClickDelete}
            disabled={loading}
          >
            Delete Transaction
          </button>
        </div>
      )}
    </>
  );
}

export default TransactionForm;

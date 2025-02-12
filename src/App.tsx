import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { UserWarning } from './UserWarning';
import { fetchTodos, addTodo, deleteTodo } from './api/todoApi';
import { Todo } from './components/TodoItem';

const USER_ID = 2311;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      try {
        const todosData = await fetchTodos(USER_ID);

        setTodos(todosData);
      } catch (error) {
        setErrorMessage('Unable to load todos');
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    if (newTodo.trim() === '') {
      inputRef.current?.focus();
    }
  }, [newTodo]);

  const handleNewTodoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setNewTodo(event.target.value);
  };

  const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newTodo.trim() === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    const tempTodoData: Todo = {
      id: Date.now(),
      title: newTodo,
      completed: false,
    };

    setTempTodo(tempTodoData);
    setNewTodo('');

    try {
      const addedTodo = await addTodo({
        title: tempTodoData.title,
        userId: USER_ID,
      });

      setTodos(prevTodos => [...prevTodos, addedTodo]);
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      setTempTodo(null);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setLoading(true);
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          newTodo={newTodo}
          disabled={Boolean(tempTodo)}
          onNewTodoChange={handleNewTodoChange}
          onAddTodo={handleAddTodo}
          inputRef={inputRef}
        />
        <TodoList
          todos={todos}
          tempTodo={tempTodo}
          filter={filter}
          loading={loading}
          onDelete={handleDeleteTodo}
        />
        {todos.length > 0 && (
          <Footer
            todos={todos}
            filter={filter}
            onFilterChange={setFilter}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </div>
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${errorMessage ? '' : 'hidden'}`}
      >
        {errorMessage}
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage(null)}
        ></button>
      </div>
    </div>
  );
};

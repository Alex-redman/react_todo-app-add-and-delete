/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useRef } from 'react';
import { UserWarning } from './UserWarning';

const USER_ID = 2311;
const API_URL = 'https://mate.academy/students-api';

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

// Додаємо тип для фільтрів
type FilterType = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingTodoIds, setProcessingTodoIds] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const newTodoFieldRef = useRef<HTMLInputElement>(null);

  const clearError = () => {
    setError('');
  };

  useEffect(() => {
    const timer = error ? setTimeout(() => clearError(), 3000) : null;

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [error]);

  const loadTodos = async () => {
    setIsLoading(true);
    setError(''); // Очищаємо попередню помилку

    try {
      const response = await fetch(`${API_URL}/todos?userId=${USER_ID}`);

      if (!response.ok) {
        throw new Error('Unable to load todos');
      }

      const data = await response.json();

      setTodos(data);
    } catch (e) {
      setError('Unable to load todos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async (title: string) => {
    setIsLoading(true);

    const temp: Todo = {
      id: 0,
      userId: USER_ID,
      title,
      completed: false,
    };

    setTempTodo(temp);

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          title,
          completed: false,
        }),
      });
      const newTodo = await response.json();

      setTodos(currentTodos => [...currentTodos, newTodo]);
    } catch {
      setError('Unable to add a todo');
    } finally {
      setIsLoading(false);
      setTempTodo(null);
    }
  };

  const deleteTodo = async (todoId: number) => {
    setProcessingTodoIds(current => [...current, todoId]);

    try {
      const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error();
      }

      setTodos(currentTodos => currentTodos.filter(todo => todo.id !== todoId));
    } catch {
      setError('Unable to delete a todo');
    } finally {
      setProcessingTodoIds(current => current.filter(id => id !== todoId));
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoTitle(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Очищаємо попередню помилку

    if (!newTodoTitle.trim()) {
      setError('Title should not be empty');

      return;
    }

    await addTodo(newTodoTitle.trim());
    setNewTodoTitle('');
  };

  const handleToggleTodo = (todoId: number) => {
    setTodos(currentTodos =>
      currentTodos.map(todo => {
        if (todo.id === todoId) {
          return { ...todo, completed: !todo.completed };
        }

        return todo;
      }),
    );
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const filteredTodos = todos.filter(todo => {
    switch (activeFilter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  // Додаємо useEffect для фокусу
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newTodoFieldRef.current) {
        newTodoFieldRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Порожній масив залежностей - виконається тільки при монтуванні

  const clearCompleted = async () => {
    // Отримуємо ID всіх завершених задач
    const completedIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    // Додаємо всі ID до масиву тих, що обробляються
    setProcessingTodoIds(current => [...current, ...completedIds]);

    try {
      // Видаляємо кожну завершену задачу
      await Promise.all(
        completedIds.map(todoId =>
          fetch(`${API_URL}/todos/${todoId}`, {
            method: 'DELETE',
          }),
        ),
      );

      // Видаляємо завершені задачі з локального стану
      setTodos(currentTodos => currentTodos.filter(todo => !todo.completed));
    } catch {
      setError('Unable to delete todos');
    } finally {
      // Прибираємо ID з масиву тих, що обробляються
      setProcessingTodoIds(current =>
        current.filter(id => !completedIds.includes(id)),
      );
    }
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <form onSubmit={handleSubmit}>
          <input
            data-cy="NewTodoField"
            ref={newTodoFieldRef}
            type="text"
            className="todoapp__new-todo"
            placeholder="What needs to be done?"
            value={newTodoTitle}
            onChange={handleTitleChange}
            disabled={isLoading}
          />
        </form>

        <ul className="todoapp__list">
          {filteredTodos.map(todo => (
            <li
              data-cy="Todo"
              key={todo.id}
              className={`todo ${todo.completed ? 'completed' : ''}`}
            >
              <input
                id={`todo-${todo.id}`}
                type="checkbox"
                className="todo__status"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id)}
              />

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              <button
                data-cy="TodoDelete"
                type="button"
                className="todo__remove"
                onClick={() => deleteTodo(todo.id)}
              >
                ×
              </button>

              <div
                data-cy="TodoLoader"
                className={`modal overlay ${processingTodoIds.includes(todo.id) ? 'is-active' : ''}`}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </li>
          ))}

          {tempTodo && (
            <li data-cy="Todo" className="todo">
              <input
                type="checkbox"
                className="todo__status"
                checked={false}
                disabled
              />

              <span className="todo__title">{tempTodo.title}</span>

              <button
                data-cy="TodoDelete"
                type="button"
                className="todo__remove"
              >
                ×
              </button>
            </li>
          )}
        </ul>

        <div
          data-cy="ErrorNotification"
          className={`notification is-error ${error ? '' : 'hidden'}`}
        >
          <div data-cy="ErrorMessage">{error}</div>
          <button
            data-cy="HideErrorButton"
            type="button"
            className="notification__close"
            onClick={clearError}
            aria-label="Close error"
          >
            ×
          </button>
        </div>

        {todos.length > 0 && (
          <>
            <nav data-cy="Filter" className="filter">
              <a
                data-cy="FilterLinkAll"
                href="#/"
                className={`filter__link ${activeFilter === 'all' ? 'selected' : ''}`}
                onClick={e => {
                  e.preventDefault();
                  handleFilterChange('all');
                }}
              >
                All
              </a>

              <a
                data-cy="FilterLinkActive"
                href="#/active"
                className={`filter__link ${activeFilter === 'active' ? 'selected' : ''}`}
                onClick={e => {
                  e.preventDefault();
                  handleFilterChange('active');
                }}
              >
                Active
              </a>

              <a
                data-cy="FilterLinkCompleted"
                href="#/completed"
                className={`filter__link ${activeFilter === 'completed' ? 'selected' : ''}`}
                onClick={e => {
                  e.preventDefault();
                  handleFilterChange('completed');
                }}
              >
                Completed
              </a>
            </nav>

            <span data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            {todos.some(todo => todo.completed) && (
              <button
                data-cy="ClearCompletedButton"
                type="button"
                className="todoapp__clear-completed"
                onClick={clearCompleted}
              >
                Clear completed
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

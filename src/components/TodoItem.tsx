/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  loading: boolean;
  onDelete: (id: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  loading,
  onDelete,
}) => {
  return (
    <div className={`todo ${todo.completed ? 'completed' : ''}`} data-cy="Todo">
      <label className="todo__status-label">
        <input
          type="checkbox"
          className="todo__status"
          data-cy="TodoStatus"
          checked={todo.completed}
          readOnly
        />
      </label>
      <span className="todo__title" data-cy="TodoTitle">
        {todo.title}
      </span>
      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={() => onDelete(todo.id)}
      >
        x
      </button>
      <div
        data-cy="TodoLoader"
        className={`modal overlay ${loading ? 'is-active' : ''}`}
      >
        <div className="modal-background has-background-white-ter"></div>
        <div className="loader"></div>
      </div>
    </div>
  );
};

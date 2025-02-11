import React from 'react';
import { TodoItem, Todo } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  filter: string;
  loading: boolean;
  onDelete: (id: number) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  filter,
  loading,
  onDelete,
}) => {
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  return (
    <section className="todoapp__main" data-cy="TodoList">
      <div>
        {filteredTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            loading={loading}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
};

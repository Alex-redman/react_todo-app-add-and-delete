import React from 'react';
import { TodoItem, Todo } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  tempTodo?: Todo | null;
  filter: string;
  loading: boolean;
  onDelete: (id: number) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  tempTodo,
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

  if (tempTodo && (filter === 'all' || filter === 'active')) {
    filteredTodos.push(tempTodo);
  }

  return (
    <section className="todoapp__main" data-cy="TodoList">
      <div>
        {filteredTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            loading={tempTodo && todo.id === tempTodo.id ? true : loading}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Todo as TodoType } from './types/Todo';
import cn from 'classnames';

/* eslint-disable jsx-a11y/label-has-associated-control */

type Props = {
  todo: TodoType;
  loadingTodoId?: number | null;
  onUpdate?: (id: number, updates: Partial<TodoType>) => void;
  onDelete?: (id: number) => void;
};

export const Todo: React.FC<Props> = ({
  todo,
  loadingTodoId,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Коли loadingTodoId змінюється, запускаємо затримку
  useEffect(() => {
    if (loadingTodoId === todo.id) {
      // Запускаємо затримку 100ms перед показом loader'а
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLoading(true);
      }, 200);
    } else {
      // Якщо ми більше не грузимо - прибираємо loader
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      setShowLoading(false);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loadingTodoId, todo.id]);

  const handleToggleCompleted = () => {
    onUpdate?.(todo.id, { completed: !todo.completed });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(todo.title);
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onUpdate?.(todo.id, { title: editValue.trim() });
    } else {
      onDelete?.(todo.id);
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    }

    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(todo.title);
    }
  };

  const handleDelete = () => {
    onDelete?.(todo.id);
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: todo.completed })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={handleToggleCompleted}
        />
      </label>

      {isEditing ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSaveEdit();
          }}
        >
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            autoFocus
          />
        </form>
      ) : (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={handleDoubleClick}
        >
          {todo.title}
        </span>
      )}

      {/* Remove button appears only on hover */}
      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={handleDelete}
      >
        ×
      </button>

      {/* overlay will cover the todo while it is being deleted or updated */}
      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', { 'is-active': showLoading })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};

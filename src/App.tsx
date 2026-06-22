/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef } from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodos,
  USER_ID,
  addTodo,
  updateTodo,
  deleteTodo,
} from './api/todos';
import { useState } from 'react';
import { TodosList } from './Todos_list';
import { Todo } from './types/Todo';

type FilterType = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [allTodosCompleted, setAllTodosCompleted] = useState(false);
  const [loadingTodoId, setLoadingTodoId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [taskCounter, setTaskCounter] = useState(0);

  // Function to show error with auto-dismiss after 3 seconds
  const showError = (message: string) => {
    setError(message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // Load todos on component mount
  useEffect(() => {
    getTodos()
      .then(data => {
        setTodos(data);
      })
      .catch(() => {
        showError('Unable to load todos');
      });
  }, []);

  // Function to close error manually
  const handleCloseError = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setError(null);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Calculate if all todos are completed dynamically
  useEffect(() => {
    const isAllCompleted =
      todos.length > 0 && todos.every(todo => todo.completed);

    setAllTodosCompleted(isAllCompleted);
    setTaskCounter(todos.filter(todo => !todo.completed).length);
  }, [todos]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      showError('Title should not be empty');

      return;
    }

    setIsAdding(true);
    addTodo(inputValue.trim())
      .then(newTodo => {
        setTodos([...todos, newTodo]);
        setInputValue('');
        setIsAdding(false);
      })
      .catch(() => {
        showError('Unable to add a todo');
        setIsAdding(false);
      });
  };

  const handleUpdateTodo = (id: number, updates: Partial<Todo>) => {
    setLoadingTodoId(id);
    updateTodo(id, updates)
      .then(updatedTodo => {
        setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
        setLoadingTodoId(null);
      })
      .catch(() => {
        showError('Unable to update a todo');
        setLoadingTodoId(null);
      });
  };

  const handleDeleteTodo = (id: number) => {
    setLoadingTodoId(id);
    deleteTodo(id)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
        setLoadingTodoId(null);
      })
      .catch(() => {
        showError('Unable to delete a todo');
        setLoadingTodoId(null);
      });
  };

  const handleToggleAll = () => {
    const newCompletedStatus = !allTodosCompleted;

    Promise.all(
      todos.map(todo => updateTodo(todo.id, { completed: newCompletedStatus })),
    )
      .then(updatedTodos => {
        setTodos(updatedTodos);
      })
      .catch(() => {
        showError('Unable to update a todo');
      });
  };

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    Promise.all(completedTodos.map(todo => deleteTodo(todo.id)))
      .then(() => {
        setTodos(todos.filter(todo => !todo.completed));
      })
      .catch(() => {
        showError('Unable to delete a todo');
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={`todoapp__toggle-all ${allTodosCompleted ? 'active' : ''}`}
            data-cy="ToggleAllButton"
            onClick={handleToggleAll}
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
          </form>
        </header>

        <TodosList
          todos={filteredTodos}
          loadingTodoId={loadingTodoId}
          isAdding={isAdding}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {taskCounter} {taskCounter === 1 ? 'item' : 'items'} left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={e => {
                  e.preventDefault();
                  setFilter('all');
                }}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={e => {
                  e.preventDefault();
                  setFilter('active');
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={e => {
                  e.preventDefault();
                  setFilter('completed');
                }}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={handleClearCompleted}
              disabled={!todos.some(todo => todo.completed)}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${!error ? 'hidden' : ''}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={handleCloseError}
        />
        {error}
      </div>
    </div>
  );
};

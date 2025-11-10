package com.cabbage.app.service;

import com.cabbage.app.model.TodoItem;
import com.cabbage.app.repository.TodoItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoService {
    private final TodoItemRepository repository;

    public List<TodoItem> getAllTodos() {
        return repository.findAll();
    }

    public List<TodoItem> getIncompleteTodos() {
        return repository.findByCompletedFalse();
    }

    public TodoItem createTodo(TodoItem todo) {
        return repository.save(todo);
    }

    @Transactional
    public TodoItem updateTodo(Long id, TodoItem todo) {
        TodoItem existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));

        existing.setTitle(todo.getTitle());
        existing.setDescription(todo.getDescription());
        existing.setPriority(todo.getPriority());
        existing.setDueDate(todo.getDueDate());
        existing.setCompleted(todo.getCompleted());

        return repository.save(existing);
    }

    public void deleteTodo(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public TodoItem toggleComplete(Long id) {
        TodoItem todo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));
        todo.setCompleted(!todo.getCompleted());
        return repository.save(todo);
    }

    public long getTotalCount() {
        return repository.count();
    }

    public long getCompletedCount() {
        return repository.countByCompleted(true);
    }
}

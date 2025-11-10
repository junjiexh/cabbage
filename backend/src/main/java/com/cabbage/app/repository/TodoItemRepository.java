package com.cabbage.app.repository;

import com.cabbage.app.model.TodoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    List<TodoItem> findByCompletedFalse();
    long countByCompleted(boolean completed);
}

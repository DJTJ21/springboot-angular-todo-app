package com.ideploy.todo.repository;

import com.ideploy.todo.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    List<Todo> findByCompleted(boolean completed);
    
    List<Todo> findAllByOrderByDateCreationDesc();
}

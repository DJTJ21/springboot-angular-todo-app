package com.ideploy.todo.service;

import com.ideploy.todo.model.Todo;
import com.ideploy.todo.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TodoService {

    private final TodoRepository todoRepository;

    @Autowired
    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public List<Todo> getAllTodos() {
        return todoRepository.findAllByOrderByDateCreationDesc();
    }

    public Optional<Todo> getTodoById(Long id) {
        return todoRepository.findById(id);
    }

    public List<Todo> getTodosByStatus(boolean completed) {
        return todoRepository.findByCompleted(completed);
    }

    public Todo createTodo(Todo todo) {
        return todoRepository.save(todo);
    }

    public Optional<Todo> updateTodo(Long id, Todo todoDetails) {
        return todoRepository.findById(id).map(todo -> {
            todo.setTitre(todoDetails.getTitre());
            todo.setDescription(todoDetails.getDescription());
            todo.setCompleted(todoDetails.isCompleted());
            return todoRepository.save(todo);
        });
    }

    public Optional<Todo> toggleTodoStatus(Long id) {
        return todoRepository.findById(id).map(todo -> {
            todo.setCompleted(!todo.isCompleted());
            return todoRepository.save(todo);
        });
    }

    public boolean deleteTodo(Long id) {
        return todoRepository.findById(id).map(todo -> {
            todoRepository.delete(todo);
            return true;
        }).orElse(false);
    }

    public long countIncompleteTodos() {
        return todoRepository.findByCompleted(false).size();
    }
}

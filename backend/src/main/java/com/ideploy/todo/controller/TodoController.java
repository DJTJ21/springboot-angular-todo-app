package com.ideploy.todo.controller;

import com.ideploy.todo.model.Todo;
import com.ideploy.todo.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TodoController {

    private final TodoService todoService;

    @Autowired
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "iDeploy Todo API");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/todos")
    public ResponseEntity<List<Todo>> getAllTodos(
            @RequestParam(required = false) Boolean completed) {
        List<Todo> todos;
        if (completed != null) {
            todos = todoService.getTodosByStatus(completed);
        } else {
            todos = todoService.getAllTodos();
        }
        return ResponseEntity.ok(todos);
    }

    @GetMapping("/todos/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        return todoService.getTodoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/todos")
    public ResponseEntity<Todo> createTodo(@Valid @RequestBody Todo todo) {
        Todo createdTodo = todoService.createTodo(todo);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTodo);
    }

    @PutMapping("/todos/{id}")
    public ResponseEntity<Todo> updateTodo(
            @PathVariable Long id,
            @Valid @RequestBody Todo todoDetails) {
        return todoService.updateTodo(id, todoDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/todos/{id}/toggle")
    public ResponseEntity<Todo> toggleTodoStatus(@PathVariable Long id) {
        return todoService.toggleTodoStatus(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/todos/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        boolean deleted = todoService.deleteTodo(id);
        return deleted ? ResponseEntity.noContent().build() 
                       : ResponseEntity.notFound().build();
    }

    @GetMapping("/todos/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) todoService.getAllTodos().size());
        stats.put("incomplete", todoService.countIncompleteTodos());
        stats.put("completed", (long) todoService.getTodosByStatus(true).size());
        return ResponseEntity.ok(stats);
    }
}

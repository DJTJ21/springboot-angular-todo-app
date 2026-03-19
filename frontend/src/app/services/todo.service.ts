import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`);
  }

  getTodosByStatus(completed: boolean): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos?completed=${completed}`);
  }

  getTodoById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/todos/${id}`);
  }

  createTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, todo);
  }

  updateTodo(id: number, todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/todos/${id}`, todo);
  }

  toggleTodoStatus(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/todos/${id}/toggle`, {});
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/${id}`);
  }

  getStats(): Observable<{ total: number; incomplete: number; completed: number }> {
    return this.http.get<{ total: number; incomplete: number; completed: number }>(
      `${this.apiUrl}/todos/stats`
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from './services/todo.service';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  
  newTodo: Todo = {
    titre: '',
    description: '',
    completed: false
  };
  
  currentFilter: 'all' | 'active' | 'completed' = 'all';
  incompleteTodosCount = 0;
  isLoading = false;
  errorMessage = '';

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.todoService.getAllTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.applyFilter();
        this.updateIncompleteTodosCount();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.errorMessage = 'Impossible de charger les tâches. Vérifiez que le backend est démarré.';
        this.isLoading = false;
      }
    });
  }

  addTodo(): void {
    if (!this.newTodo.titre.trim()) {
      return;
    }

    this.todoService.createTodo(this.newTodo).subscribe({
      next: (todo) => {
        this.todos.unshift(todo);
        this.applyFilter();
        this.updateIncompleteTodosCount();
        this.resetForm();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la tâche:', error);
        this.errorMessage = 'Impossible de créer la tâche.';
      }
    });
  }

  toggleTodo(todo: Todo): void {
    if (!todo.id) return;

    this.todoService.toggleTodoStatus(todo.id).subscribe({
      next: (updatedTodo) => {
        const index = this.todos.findIndex(t => t.id === updatedTodo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
          this.applyFilter();
          this.updateIncompleteTodosCount();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
      }
    });
  }

  deleteTodo(id: number | undefined): void {
    if (!id) return;

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter(t => t.id !== id);
        this.applyFilter();
        this.updateIncompleteTodosCount();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la tâche:', error);
      }
    });
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.currentFilter) {
      case 'active':
        this.filteredTodos = this.todos.filter(t => !t.completed);
        break;
      case 'completed':
        this.filteredTodos = this.todos.filter(t => t.completed);
        break;
      default:
        this.filteredTodos = [...this.todos];
    }
  }

  updateIncompleteTodosCount(): void {
    this.incompleteTodosCount = this.todos.filter(t => !t.completed).length;
  }

  resetForm(): void {
    this.newTodo = {
      titre: '',
      description: '',
      completed: false
    };
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskList, TaskListResponse } from './task-list.interface';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { UtilService } from '../../globalServices/utils/util.service';
import { Category } from '../../globalInterfaces';
import { AuthService } from '../../globalServices/auth/auth.service';
import { LoginResponse } from '../login/login.interface';
import { TasklistService } from './services/tasklist.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, FormsModule, TaskModalComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  tasks!: TaskListResponse[];
  filteredTasks!: TaskListResponse[];
  searchQuery = '';
  filterStatus = 'all';
  selectedTask: TaskList | null = null;
  isModalOpen = false;
  isEditMode = false;
  categories: Category[] = [];
  user!: LoginResponse;
  httpError!: string;

  constructor(
    protected utilService: UtilService,
    private authService: AuthService,
    private tasklistService: TasklistService
  ) {}

  ngOnInit(): void {
    this.categories = this.utilService.getCategories();
    this.authService.getUser$().subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
    this.getTasks();
  }

  openModal(task: TaskList | null = null): void {
    this.selectedTask = task
      ? { ...task }
      : {
          id: 0,
          title: '',
          description: '',
          status: 'Pending',
          start: new Date(),
          end: new Date(),
          category: 'Work',
        };
    this.isEditMode = !!task;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedTask = null;
    this.httpError = '';
    this.getTasks();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter((task) => {
      const matchesSearch =
        !this.searchQuery ||
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (task.description &&
          task.description
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()));

      const matchesStatus =
        this.filterStatus === 'all' ||
        task.status.toLowerCase() === this.filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }

  saveTask(task: TaskList): void {
    //add user to task
    if (!task.user) {
      task.user = { connect: { id: this.user.id } };
    } else {
      task.user.connect.id = this.user.id;
    }

    if (this.isEditMode && task.id) {
      this.editTask(task);
    } else {
      this.createTask(task);
    }
  }

  private editTask(task: TaskList) {
    this.tasklistService.editTask$(task).subscribe({
      next: () => {
        this.httpError = '';
        this.closeModal();
      },
      error: (error) => {
        this.httpError = error.error.message.message;
      },
    });
  }

  private createTask(task: TaskList) {
    this.tasklistService.addTask$(task).subscribe({
      next: () => {
        this.httpError = '';
        this.closeModal();
      },
      error: (error) => {
        this.httpError = error.error.message.message;
      },
    });
  }

  private getTasks() {
    this.tasklistService.getTask$().subscribe({
      next: (response) => {
        this.tasks = response;
        this.filteredTasks = response;
        this.httpError = '';
      },
      error: (error) => {
        this.httpError = error.error.message.message;
      },
    });
  }

  onDeleteTask(taskId: number): void {
    this.tasklistService.deleteTask$(taskId).subscribe({
      next: () => {
        this.applyFilters();
        this.httpError = '';
        this.getTasks();
      },
      error: (error) => {
        this.httpError = error.error.message.message;
      },
    });
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskList } from '../task-list/task-list.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilService } from '../../globalServices/utils/util.service';
import { Category } from '../../globalInterfaces';

@Component({
  selector: 'app-task-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.scss',
})
export class TaskModalComponent implements OnInit {
  @Input() task: TaskList | null = {
    title: '',
    description: '',
    status: 'Pending',
    start: new Date(),
    end: new Date(),
    category: 'Work',
  };
  @Input() httpError = '';
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<TaskList>();
  @Output() close = new EventEmitter<void>();

  categories: Category[] = [];
  formattedStart: string = '';
  formattedEnd: string = '';

  constructor(protected utilService: UtilService) {}

  ngOnInit(): void {
    //get categories
    this.categories = this.utilService.getCategories();

    //format task to string
    if (this.task) {
      this.formattedStart = this.formatDateTime(this.task.start);
      this.formattedEnd = this.formatDateTime(this.task.end);
    }
  }

  private formatDateTime(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust to local time zone
    return d.toISOString().slice(0, 16);
  }

  private parseDateTime(dateTimeString: string): Date {
    return new Date(dateTimeString);
  }

  onSubmit(): void {
    if (!this.task) {
      return;
    }

    if (this.task?.title && this.task.status) {
      this.task.start = this.parseDateTime(this.formattedStart);
      this.task.end = this.parseDateTime(this.formattedEnd);
      this.save.emit(this.task);
    } else {
      this.httpError = 'Enter valid data for Title';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}

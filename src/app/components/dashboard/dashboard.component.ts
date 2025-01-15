import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Chart from 'chart.js/auto';

// Angular Material Modules
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TasklistService } from '../task-list/services/tasklist.service';
import { TaskListResponse } from '../task-list/task-list.interface';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('analyticsChart') analyticsChart!: ElementRef;
  constructor(private tasklistService: TasklistService) {}

  metrics!: {
    title: string;
    value: number;
    description: string;
    colorClass: string;
  }[];

  tasks: TaskListResponse[] = [];
  filteredTasks: TaskListResponse[] = [];

  statuses!: string[];
  categories!: string[];

  selectedStatus = 'All';
  selectedCategory = 'All';

  displayedColumns: string[] = [
    'name',
    'status',
    'category',
    'deadline',
    //'actions',  will decide if to implement later
  ];

  ngAfterViewInit() {
    this.getTasks();
  }

  private getTasks() {
    this.tasklistService.getTask$().subscribe({
      next: (response) => {
        this.tasks = response;
        this.filteredTasks = [...response];

        // Dynamically calculate metrics
        this.metrics = [
          {
            title: 'Completed',
            value: response.filter((metric) => metric.status === 'Completed')
              .length,
            description: 'Tasks completed',
            colorClass: 'completed',
          },
          {
            title: 'Pending',
            value: response.filter((metric) => metric.status === 'Pending')
              .length,
            description: 'Tasks remaining to complete',
            colorClass: 'pending',
          },
          {
            title: 'Overdue',
            value: response.filter((metric) => metric.status === 'Overdue')
              .length,
            description: 'Tasks past due date',
            colorClass: 'overdue',
          },
        ];

        // Dynamically get metrics
        this.statuses = [
          'All',
          ...new Set(response.map((task) => task.status)),
        ];

        // Dynamically get categories
        this.categories = [
          'All',
          ...new Set(response.map((task) => task.category)),
        ];

        this.updateChart();
      },
      error: (error) => {
        throw error;
      },
    });
  }

  applyFilter() {
    this.filteredTasks = this.tasks.filter((task) => {
      const statusMatch =
        this.selectedStatus === 'All' || task.status === this.selectedStatus;
      const categoryMatch =
        this.selectedCategory === 'All' ||
        task.category === this.selectedCategory;
      return statusMatch && categoryMatch;
    });
  }

  private updateChart() {
    if (!this.tasks || this.tasks.length === 0) {
      return;
    }
    setTimeout(() => {
      const ctx = document.getElementById(
        'analyticsChart'
      ) as HTMLCanvasElement;
      if (!ctx) {
        return;
      }

      // Create the chart
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Pending', 'Overdue'],
          datasets: [
            {
              label: 'Tasks',
              data: [
                this.metrics.find((metric) => metric.title === 'Completed')
                  ?.value || 0,
                this.metrics.find((metric) => metric.title === 'Pending')
                  ?.value || 0,
                this.metrics.find((metric) => metric.title === 'Overdue')
                  ?.value || 0,
              ],
              backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
            },
          ],
        },
      });
    });
  }
}

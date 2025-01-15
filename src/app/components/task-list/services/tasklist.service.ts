import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskList, TaskListResponse } from '../task-list.interface';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TasklistService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  addTask$(task: TaskList): Observable<TaskListResponse> {
    const { id, ...data } = task;
    return this.http.post<TaskListResponse>(`${this.apiUrl}/tasks`, data);
  }

  getTask$(): Observable<TaskListResponse[]> {
    return this.http
      .get<TaskListResponse[]>(`${this.apiUrl}/tasks`)
      .pipe(
        map((tasks) =>
          tasks.sort(
            (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
          )
        )
      );
  }

  editTask$(task: TaskList): Observable<TaskListResponse> {
    const { title, category, description, start, end } = task;
    const data = {
      title,
      category,
      description,
      start,
      end,
      user: { connect: { id: 22 } },
    };

    return this.http.patch<TaskListResponse>(
      `${this.apiUrl}/tasks/${task.id}`,
      data
    );
  }

  deleteTask$(taskId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/tasks/${taskId}`, {
      responseType: 'text' as 'json',
    });
  }
}

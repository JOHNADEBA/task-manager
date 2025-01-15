export interface TaskList {
  id?: number;
  title: string;
  description?: string | null;
  status: 'Completed' | 'Overdue' | 'Pending';
  start: Date;
  end: Date;
  category: 'Work' | 'Personal' | 'Home';
  user?: { connect: { id: number } };
}

export interface TaskListResponse {
  id: number;
  title: string;
  category: 'Work' | 'Personal' | 'Home';
  description?: string | null;
  status: 'Completed' | 'Overdue' | 'Pending';
  start: Date;
  end: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

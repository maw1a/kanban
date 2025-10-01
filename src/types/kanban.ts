export interface Task {
	id: string;
	title: string;
	description?: string;
	status: string;
	createdAt: string;
	completedAt: string | null;
}

export interface ColumnType {
	id: string;
	title: string;
	icon: string;
	color: string;
}

export interface WorkTiming {
	startTime: string; // HH:MM format
	endTime: string; // HH:MM format
	workDays: number[]; // 0-6 (Sunday-Saturday)
}

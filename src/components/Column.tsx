import { useDrop } from "react-dnd";
import { TaskCard } from "./TaskCard";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Task, ColumnType } from "../types/kanban";
import { cn } from "./ui/utils";
import { COLORS_CLASSES, ICON_OPTIONS } from "../utils/constants";

interface ColumnProps {
	column: ColumnType;
	tasks: Task[];
	onMoveTask: (taskId: string, newStatus: string) => void;
	onDeleteTask: (taskId: string) => void;
	onEditTask: (taskId: string, newTask: Task) => void;
	onAddTask: (title: string) => void;
}

export function Column({
	column,
	tasks,
	onMoveTask,
	onDeleteTask,
	onEditTask,
}: ColumnProps) {
	const [{ isOver }, drop] = useDrop({
		accept: "task",
		drop: (item: { id: string }) => {
			onMoveTask(item.id, column.id);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
		}),
	});

	return (
		<Card
			ref={(r) => {
				drop(r);
			}}
			className={cn(
				"border-2 transition-colors min-w-77",
				COLORS_CLASSES[column.color]?.column || "bg-gray-100 border-gray-300",
				COLORS_CLASSES[column.color]?.ring,
				isOver && "ring-4",
			)}
		>
			<CardHeader className="pb-3 pt-5">
				<div className="flex items-center justify-start gap-2">
					<div className={COLORS_CLASSES[column.color]?.text}>
						{ICON_OPTIONS.get(column.icon)}
					</div>
					<h3 className="font-semibold text-gray-900 flex-1">{column.title}</h3>
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"text-sm leading-none text-gray-900 h-8 min-w-8 rounded flex items-center justify-center",
								COLORS_CLASSES[column.color]?.card,
							)}
						>
							<span>{tasks.length}</span>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{tasks.map((task) => (
					<TaskCard
						key={task.id}
						task={task}
						onDelete={onDeleteTask}
						onEdit={onEditTask}
					/>
				))}

				{tasks.length === 0 && (
					<div className="text-center py-8 text-gray-400">
						<p className="text-sm">No tasks yet</p>
						<p className="text-xs mt-1">Drag tasks here or click + to add</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

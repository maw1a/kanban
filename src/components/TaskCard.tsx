import { useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2, Edit2, Clock, CheckCircle } from "lucide-react";
import { Task } from "../types/kanban";
import { Textarea } from "./ui/textarea";
import z from "zod";
import { Label } from "./ui/label";

interface TaskCardProps {
	task: Task;
	onDelete: (taskId: string) => void;
	onEdit: (taskId: string, newTask: Task) => void;
}

const taskSchema = z.object({
	title: z.string().min(1, "Task title is required"),
	description: z.string().optional(),
	status: z.string().min(1, "Task status is required"),
});

export function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTask, setEditTask] = useState(task);

	const [{ isDragging }, drag] = useDrag({
		type: "task",
		item: { id: task.id },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleSaveEdit = () => {
		const result = taskSchema.safeParse(editTask);
		if (result.success) {
			const { description, ..._editTask } = editTask;
			onEdit(task.id, {
				description:
					description && description?.length > 0 ? description : undefined,
				..._editTask,
			});
			setIsEditing(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const validationResult = useMemo(() => {
		const result = taskSchema.safeParse(editTask);
		return result;
	}, [editTask]);

	return (
		<Card
			ref={(r) => {
				drag(r);
			}}
			className={`group cursor-grab active:cursor-grabbing bg-white border shadow-sm hover:shadow-md transition-shadow ${
				isDragging ? "opacity-50" : ""
			}`}
		>
			<CardContent className="p-3">
				{isEditing ? (
					<div className="space-y-2">
						<div className="space-y-2">
							<Label htmlFor="title" className="text-xs">
								Title
							</Label>
							<Input
								id="title"
								value={editTask.title}
								onChange={(e) =>
									setEditTask((p) => ({ ...p, title: e.target.value }))
								}
								className="text-sm"
								autoFocus
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description" className="text-xs">
								Description
							</Label>
							<Textarea
								id="description"
								value={editTask.description}
								onChange={(e) =>
									setEditTask((p) => ({ ...p, description: e.target.value }))
								}
								className="text-sm"
							/>
						</div>
						<div className="flex gap-1">
							<Button
								size="sm"
								disabled={!validationResult.success}
								onClick={handleSaveEdit}
								className="text-xs h-7"
							>
								Save
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									setIsEditing(false);
									setEditTask(task);
								}}
								className="text-xs h-7"
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-2">
							<div className="flex flex-col flex-1 gap-1">
								<h4 className="text-sm font-medium text-gray-900 flex-1">
									{task.title}
								</h4>
								{typeof task.description !== "undefined" && (
									<p className="text-xs font-medium text-gray-400 flex-1 line-clamp-3">
										{task.description}
									</p>
								)}
							</div>
							<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => setIsEditing(true)}
									className="h-6 w-6 p-0 hover:bg-blue-100"
								>
									<Edit2 className="h-3 w-3" />
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => onDelete(task.id)}
									className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
								>
									<Trash2 className="h-3 w-3" />
								</Button>
							</div>
						</div>

						<div className="flex flex-col items-start justify-center gap-1 text-xs text-gray-500">
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>{formatDate(task.createdAt)}</span>
							</div>

							{task.status === "completed" && task.completedAt && (
								<div className="flex items-center gap-1 text-green-600">
									<CheckCircle className="h-3 w-3" />
									<span>{formatDate(task.completedAt)}</span>
								</div>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

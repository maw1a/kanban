import { useMemo, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { InfoIcon } from "lucide-react";
import { ColumnType, Task } from "../types/kanban";
import { cn } from "./ui/utils";
import { COLORS_CLASSES } from "../utils/constants";

interface NewTaskProps {
	isOpen: boolean;
	columns: ColumnType[];
	defaultTask?: Task;
	onClose: () => void;
	onSave: (task: Pick<Task, "title" | "description" | "status">) => void;
}

const newTaskSchema = z.object({
	title: z.string().min(1, "Task title is required"),
	description: z.string().optional(),
	status: z.string().min(1, "Task status is required"),
});

export function NewTask({
	isOpen,
	columns,
	defaultTask,
	onClose,
	onSave,
}: NewTaskProps) {
	const defaultValue = {
		title: defaultTask?.title || "",
		status: defaultTask?.status || columns[0].id,
		description: defaultTask?.description,
	};
	const [localTask, setLocalTask] =
		useState<Pick<Task, "title" | "description" | "status">>(defaultValue);
	const [touched, setTouched] = useState(false);

	const resetState = () => {
		setLocalTask(defaultValue);
		setTouched(false);
	};

	const onOpenChange = (open: boolean) => {
		if (!open) resetState();
		onClose();
	};

	const handleSave = () => {
		onSave(localTask);
		onClose();
	};

	const validationResult = useMemo(() => {
		const result = newTaskSchema.safeParse(localTask);
		return result;
	}, [localTask]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto font-mono">
				<DialogHeader>
					<DialogTitle>{defaultTask ? "Update Task" : "New Task"}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							type="text"
							value={localTask.title}
							onChange={(e) => {
								setTouched(true);
								setLocalTask({ ...localTask, title: e.target.value });
							}}
						/>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="description">Description</Label>
							<span className="text-xs text-gray-500">(optional)</span>
						</div>
						<Textarea
							id="description"
							value={localTask.description || ""}
							onChange={(e) => {
								setTouched(true);
								setLocalTask({ ...localTask, description: e.target.value });
							}}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select
							name="status"
							value={localTask.status}
							onValueChange={(value) =>
								setLocalTask({ ...localTask, status: value })
							}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								{columns.map((column) => (
									<SelectItem key={column.id} value={column.id}>
										<div className="flex gap-3 items-center">
											<div
												className={cn(
													`w-4 h-4 rounded`,
													COLORS_CLASSES[column.color]?.card,
												)}
											/>
											<span>{column.title}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{typeof validationResult.error !== "undefined" && touched && (
					<div className="flex items-center gap-2 w-full pt-2 text-sm text-red-600">
						<InfoIcon size={16} /> {validationResult.error.issues[0].message}
					</div>
				)}

				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button
						variant="outline"
						onClick={() => {
							onOpenChange(false);
						}}
					>
						Cancel
					</Button>
					<Button
						disabled={!validationResult.success}
						onClick={() => {
							handleSave();
							onOpenChange(false);
						}}
					>
						Create
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

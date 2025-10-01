import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface EndOfDayDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onResponse: (markAllDone: boolean) => void;
	pendingTasksCount: number;
}

export function EndOfDayDialog({
	isOpen,
	onClose,
	onResponse,
	pendingTasksCount,
}: EndOfDayDialogProps) {
	const handleMarkAllDone = () => {
		onResponse(true);
	};

	const handleKeepTasks = () => {
		onResponse(false);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-orange-500" />
						<AlertDialogTitle>End of Work Day</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="space-y-3">
						<p>
							Your work day is ending! You have{" "}
							<span className="font-semibold text-orange-600">
								{pendingTasksCount} unfinished task
								{pendingTasksCount !== 1 ? "s" : ""}
							</span>{" "}
							remaining.
						</p>
						<p>
							Would you like to mark all unfinished tasks as completed? They
							will be cleared by the start of your next work day.
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-col gap-2 sm:flex-row">
					<AlertDialogCancel
						onClick={handleKeepTasks}
						className="w-full sm:w-auto"
					>
						<AlertCircle className="h-4 w-4 mr-2" />
						Keep Tasks
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleMarkAllDone}
						className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
					>
						<CheckCircle className="h-4 w-4 mr-2" />
						Mark All Done
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

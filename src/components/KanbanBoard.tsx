import { useState, useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Column } from "./Column";
import { WorkSettings } from "./WorkSettings";
import { EndOfDayDialog } from "./EndOfDayDialog";
import { Button } from "./ui/button";
import { Settings, Plus } from "lucide-react";
import { Task, WorkTiming, ColumnType } from "../types/kanban";
import {
	loadFromStorage,
	saveToStorage,
	isWithinWorkHours,
	shouldShowEndOfDayNotification,
	getWorkingDays,
} from "../utils/storage";
import { cn } from "./ui/utils";
import { NewTask } from "./NewTask";
import { DAYS_OF_WEEK } from "../utils/constants";

const defaultColumns: ColumnType[] = [
	{ id: "pending", title: "Pending", color: "yellow", icon: "CircleDashed" },
	{
		id: "in-progress",
		title: "In Progress",
		color: "blue",
		icon: "Circle",
	},
	{
		id: "completed",
		title: "Completed",
		color: "green",
		icon: "CircleCheckBig",
	},
];

const defaultWorkTiming: WorkTiming = {
	startTime: "09:00",
	endTime: "18:00",
	workDays: [1, 2, 3, 4, 5], // Monday to Friday
};

export function KanbanBoard() {
	const [loaded, setLoaded] = useState(false);
	const [name, setName] = useState<string>("");
	const [tasks, setTasks] = useState<Task[]>([]);
	const [columns, setColumns] = useState<ColumnType[]>(defaultColumns);
	const [workTiming, setWorkTiming] = useState<WorkTiming>(defaultWorkTiming);
	const [showSettings, setShowSettings] = useState(false);
	const [showNewTask, setShowNewTask] = useState(false);
	const [showEndOfDayDialog, setShowEndOfDayDialog] = useState(false);
	const [lastNotificationDate, setLastNotificationDate] = useState<string>("");

	// Load data from localStorage on mount
	useEffect(() => {
		setLoaded(false);
		const savedName = loadFromStorage("users-name", "");
		const savedTasks = loadFromStorage("kanban-tasks", []);
		const savedColumns = loadFromStorage("kanban-columns", defaultColumns);
		const savedWorkTiming = loadFromStorage("work-timing", defaultWorkTiming);
		const savedLastNotification = loadFromStorage("last-notification-date", "");

		setName(savedName.value);
		setTasks(savedTasks.value);
		setColumns(savedColumns.value);
		setWorkTiming(savedWorkTiming.value);
		setLastNotificationDate(savedLastNotification.value);
		setTimeout(() => {
			setLoaded(true);
		}, 500);
	}, []);

	// Save data to localStorage whenever it changes
	useEffect(() => {
		saveToStorage("users-name", name);
	}, [name]);

	useEffect(() => {
		saveToStorage("kanban-tasks", tasks);
	}, [tasks]);

	useEffect(() => {
		saveToStorage("kanban-columns", columns);
	}, [columns]);

	useEffect(() => {
		saveToStorage("work-timing", workTiming);
	}, [workTiming]);

	useEffect(() => {
		saveToStorage("last-notification-date", lastNotificationDate);
	}, [lastNotificationDate]);

	// Check for end-of-day notification
	useEffect(() => {
		const checkEndOfDay = () => {
			if (shouldShowEndOfDayNotification(workTiming, lastNotificationDate)) {
				const pendingTasks = tasks.filter(
					(task) => task.status === "pending" || task.status === "in-progress",
				);
				if (pendingTasks.length > 0) {
					setShowEndOfDayDialog(true);
				}
			}
		};

		// Check immediately and then every minute
		checkEndOfDay();
		const interval = setInterval(checkEndOfDay, 60000);

		return () => clearInterval(interval);
	}, [tasks, workTiming, lastNotificationDate]);

	const addTask = (t: {
		title: string;
		description?: string;
		status: string;
	}) => {
		const newTask: Task = {
			id: Date.now().toString(),
			title: t.title,
			description: t.description,
			status: t.status,
			createdAt: new Date().toISOString(),
			completedAt: null,
		};
		setTasks([...tasks, newTask]);
	};

	const moveTask = (taskId: string, newStatus: string) => {
		setTasks(
			tasks.map((task) =>
				task.id === taskId
					? {
							...task,
							status: newStatus,
							completedAt:
								newStatus === "completed" ? new Date().toISOString() : null,
						}
					: task,
			),
		);
	};

	const deleteTask = (taskId: string) => {
		setTasks(tasks.filter((task) => task.id !== taskId));
	};

	const editTask = (taskId: string, newTask: Task) => {
		setTasks(
			tasks.map((task) =>
				task.id === taskId ? { ...task, ...newTask } : task,
			),
		);
	};

	const handleEndOfDayResponse = (markAllDone: boolean) => {
		const today = new Date().toDateString();
		setLastNotificationDate(today);

		if (markAllDone) {
			// Mark all pending and in-progress tasks as completed
			setTasks(
				tasks.map((task) =>
					task.status === "pending" || task.status === "in-progress"
						? {
								...task,
								status: "completed",
								completedAt: new Date().toISOString(),
							}
						: task,
				),
			);

			// Schedule task clearing for next workday
			setTimeout(() => {
				const today = new Date();

				// Clear completed tasks that are older than today
				setTasks((prevTasks) =>
					prevTasks.filter((task) => {
						if (task.status !== "completed" || !task.completedAt) return true;
						const completedDate = new Date(task.completedAt);
						return completedDate.toDateString() === today.toDateString();
					}),
				);
			}, 1000);
		}

		setShowEndOfDayDialog(false);
	};

	const getTasksForColumn = (columnId: string) => {
		return tasks.filter((task) => task.status === columnId);
	};

	const isWorkingHours = useMemo(
		() => isWithinWorkHours(workTiming),
		[workTiming],
	);

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="min-h-screen bg-gray-50 flex flex-col w-full">
				<div className="p-8 mx-12">
					<div className="flex justify-center pb-8">
						<div
							className={cn(
								"transition-all hover:w-26 h-9 overflow-hidden relative ease-out duration-400",
								loaded ? "w-9" : "w-26",
							)}
						>
							<img
								className="object-cover object-left h-full"
								fetchPriority="high"
								src={"/logo.svg"}
								alt={"Kanban — by maw1a"}
							/>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<div className="flex w-full items-center gap-4">
								<h1
									className="relative text-2xl font-bold text-gray-900 before:content-['👋🏼'] before:[transform-origin:70%_70%]
        hover:before:animate-[wave_1.6s_ease-in-out_1] before:text-3xl before:absolute before:-left-2.5 before:-top-0.5 before:-translate-x-full"
								>
									Hey {name}
								</h1>
								<div
									className={cn(
										"rounded-full flex gap-2 items-center text-sm border px-2.5 before:p-1 before:rounded-full",
										isWorkingHours
											? "before:bg-blue-600 text-blue-600 border-blue-600 bg-blue-100"
											: "before:bg-gray-600 text-gray-600 border-gray-600 bg-gray-100",
									)}
								>
									<span>
										{isWorkingHours ? "Time to work" : "Kick back and relax"}
									</span>
								</div>
							</div>
							<p className="text-gray-600 mt-2 text-sm">
								<span className="text-gray-400">Work hours: </span>
								<span>
									{workTiming.startTime} - {workTiming.endTime}
								</span>
								<span className="text-gray-400">, </span>
								<span>
									{getWorkingDays(workTiming.workDays).map(
										(v, idx, { length }) => {
											const last = idx === length - 1;
											if (typeof v === "number") {
												const day = DAYS_OF_WEEK[v].nm;
												return (
													<span key={v}>
														{day}
														{!last ? ", " : null}{" "}
													</span>
												);
											} else {
												const startDay = DAYS_OF_WEEK[v[0]].nm;
												const endDay = DAYS_OF_WEEK[v[1]].nm;
												return (
													<span key={v[0] + "-" + v[1]}>
														{startDay} - {endDay}
														{!last ? ", " : null}
													</span>
												);
											}
										},
									)}
								</span>
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								onClick={() => setShowNewTask(true)}
								variant="default"
								size="sm"
							>
								<Plus className="h-4 w-4 mr-2" />
								New Task
							</Button>
							<Button
								onClick={() => setShowSettings(true)}
								variant="outline"
								size="sm"
							>
								<Settings className="h-4 w-4 mr-2" />
								Settings
							</Button>
						</div>
					</div>
				</div>

				<div className="overflow-scroll flex-1 px-12 py-4">
					<div className="flex gap-6">
						{columns.map((column) => (
							<Column
								key={column.id}
								column={column}
								tasks={getTasksForColumn(column.id)}
								onMoveTask={moveTask}
								onDeleteTask={deleteTask}
								onEditTask={editTask}
								onAddTask={(title) => {
									addTask({ title, status: column.id });
								}}
							/>
						))}
						<div className="pl-12" />
					</div>
				</div>

				<WorkSettings
					isOpen={name.length === 0 || showSettings}
					onClose={() => {
						if (name.length > 0) setShowSettings(false);
					}}
					name={name}
					workTiming={workTiming}
					onSave={(wt, nm) => {
						setWorkTiming(wt);
						setName(nm);
					}}
					columns={columns}
					onSaveColumns={setColumns}
				/>

				<NewTask
					isOpen={showNewTask}
					columns={columns}
					onClose={() => {
						setShowNewTask(false);
					}}
					onSave={(t) => {
						addTask({
							title: t.title,
							description: t.description,
							status: t.status,
						});
					}}
				/>

				<EndOfDayDialog
					isOpen={showEndOfDayDialog}
					onClose={() => setShowEndOfDayDialog(false)}
					onResponse={handleEndOfDayResponse}
					pendingTasksCount={
						tasks.filter(
							(task) =>
								task.status === "pending" || task.status === "in-progress",
						).length
					}
				/>
			</div>
		</DndProvider>
	);
}

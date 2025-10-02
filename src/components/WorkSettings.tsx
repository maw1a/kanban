import React, { useEffect, useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { z } from "zod";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Trash2, GripVertical, InfoIcon } from "lucide-react";
import { WorkTiming, ColumnType } from "../types/kanban";
import { cn } from "./ui/utils";
import {
	COLOR_OPTIONS,
	DAYS_OF_WEEK,
	COLORS_CLASSES,
	ICON_OPTIONS,
} from "../utils/constants";

interface WorkSettingsProps {
	isOpen: boolean;
	onClose: () => void;
	name: string;
	workTiming: WorkTiming;
	onSave: (workTiming: WorkTiming, name: string) => void;
	columns: ColumnType[];
	onSaveColumns: (columns: ColumnType[]) => void;
}

const settingsSchema = z.object({
	name: z.string().min(1, "Name is required"),
	workTiming: z.object({
		startTime: z
			.string()
			.regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
		endTime: z
			.string()
			.regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
		workDays: z
			.array(z.number().min(0).max(6))
			.min(1, "Select at least one work day"),
	}),
	columns: z
		.array(
			z.object({
				id: z.string(),
				title: z.string().min(1, "Column title is required"),
				color: z.string().min(1, "Column color is required"),
			}),
		)
		.min(2, "At least two columns are required"),
});

interface DraggableColumnProps {
	column: ColumnType;
	index: number;
	moveColumn: (dragIndex: number, hoverIndex: number) => void;
	updateColumnTitle: (columnId: string, newTitle: string) => void;
	updateColumnColor: (columnId: string, newColor: string) => void;
	updateColumnIcon: (columnId: string, newIcon: string) => void;
	deleteColumn: (columnId: string) => void;
	isDeleteDisabled: boolean;
}

function DraggableColumn({
	column,
	index,
	moveColumn,
	updateColumnTitle,
	updateColumnColor,
	updateColumnIcon,
	deleteColumn,
	isDeleteDisabled,
}: DraggableColumnProps) {
	const [{ isDragging }, drag] = useDrag({
		type: "column",
		item: { index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const [, drop] = useDrop({
		accept: "column",
		hover: (item: { index: number }) => {
			if (item.index !== index) {
				moveColumn(item.index, index);
				item.index = index;
			}
		},
	});

	return (
		<div
			ref={(node) => {
				drag(drop(node));
			}}
			className={`flex items-center gap-2 p-3 border rounded-lg cursor-grab active:cursor-grabbing ${
				isDragging ? "opacity-50" : ""
			}`}
		>
			<GripVertical className="h-4 w-4 text-gray-400" />
			<Select
				value={column.icon}
				onValueChange={(value) => updateColumnIcon(column.id, value)}
			>
				<SelectTrigger
					size="sm"
					chevron={false}
					className="w-8 px-1.5 justify-center cursor-pointer border-transparent hover:border-input"
				>
					<div className={COLORS_CLASSES[column.color]?.text}>
						{ICON_OPTIONS.get(column.icon)}
					</div>
				</SelectTrigger>
				<SelectContent className="min-w-8">
					{Array.from(ICON_OPTIONS.entries()).map(([name, icon]) => (
						<SelectItem key={name} value={name}>
							<div className={COLORS_CLASSES[column.color]?.text}>{icon}</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				value={column.color}
				onValueChange={(value) => updateColumnColor(column.id, value)}
			>
				<SelectTrigger
					size="sm"
					chevron={false}
					className="w-8 px-1.5 justify-center cursor-pointer border-transparent hover:border-input"
				>
					<div
						className={cn(
							`w-4 h-4 rounded`,
							COLORS_CLASSES[column.color]?.card,
						)}
					/>
				</SelectTrigger>
				<SelectContent>
					{COLOR_OPTIONS.map((color) => (
						<SelectItem key={color.name} value={color.class}>
							<div className="flex item-center gap-2">
								<div
									className={cn(
										`w-4 h-4 rounded`,
										COLORS_CLASSES[color.class]?.card,
									)}
								/>
								{color.name}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Input
				value={column.title}
				onChange={(e) => updateColumnTitle(column.id, e.target.value)}
				className="flex-1"
			/>

			<Button
				size="sm"
				variant="ghost"
				onClick={() => deleteColumn(column.id)}
				disabled={isDeleteDisabled}
				className="text-red-600 hover:text-red-600 hover:bg-red-100 !px-2"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}

export function WorkSettings({
	isOpen,
	onClose,
	name,
	workTiming,
	onSave,
	columns,
	onSaveColumns,
}: WorkSettingsProps) {
	const [localName, setLocalName] = useState<string>(name);
	const [localWorkTiming, setLocalWorkTiming] =
		useState<WorkTiming>(workTiming);
	const [localColumns, setLocalColumns] = useState<ColumnType[]>(columns);
	const [newColumnTitle, setNewColumnTitle] = useState("");
	const [newColumnColor, setNewColumnColor] = useState(COLOR_OPTIONS[0].class);
	const [newColumnIcon, setNewColumnIcon] = useState("Circle");

	const handleSave = () => {
		onSave(localWorkTiming, localName);
		onSaveColumns(localColumns);
		onClose();
	};

	const handleDayToggle = (dayId: number) => {
		const updatedDays = localWorkTiming.workDays.includes(dayId)
			? localWorkTiming.workDays.filter((d) => d !== dayId)
			: [...localWorkTiming.workDays, dayId];

		setLocalWorkTiming({ ...localWorkTiming, workDays: updatedDays });
	};

	const addColumn = () => {
		if (newColumnTitle.trim()) {
			const newColumn: ColumnType = {
				id: Date.now().toString(),
				title: newColumnTitle.trim(),
				color: newColumnColor,
				icon: newColumnIcon,
			};
			setLocalColumns([...localColumns, newColumn]);
			setNewColumnTitle("");
		}
	};

	const deleteColumn = (columnId: string) => {
		// Don't allow deleting if it's one of the last 2 columns
		if (localColumns.length <= 2) return;
		setLocalColumns(localColumns.filter((col) => col.id !== columnId));
	};

	const updateColumnTitle = (columnId: string, newTitle: string) => {
		setLocalColumns(
			localColumns.map((col) =>
				col.id === columnId ? { ...col, title: newTitle } : col,
			),
		);
	};

	const updateColumnColor = (columnId: string, newColor: string) => {
		setLocalColumns(
			localColumns.map((col) =>
				col.id === columnId ? { ...col, color: newColor } : col,
			),
		);
	};

	const updateColumnIcon = (columnId: string, newIcon: string) => {
		setLocalColumns(
			localColumns.map((col) =>
				col.id === columnId ? { ...col, icon: newIcon } : col,
			),
		);
	};

	const moveColumn = (dragIndex: number, hoverIndex: number) => {
		const draggedColumn = localColumns[dragIndex];
		const newColumns = [...localColumns];
		newColumns.splice(dragIndex, 1);
		newColumns.splice(hoverIndex, 0, draggedColumn);
		setLocalColumns(newColumns);
	};

	const validationResult = useMemo(() => {
		const result = settingsSchema.safeParse({
			name: localName,
			workTiming: localWorkTiming,
			columns: localColumns,
		});
		return result;
	}, [localName, localWorkTiming, localColumns]);

	useEffect(() => {
		setLocalName(name);
		setLocalColumns(columns);
	}, [columns, name]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				closable={name.length > 0}
				className="max-w-2xl max-h-[80vh] overflow-y-auto font-mono"
				overlayClassName="backdrop-blur-lg"
			>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>

				<Tabs defaultValue="work-hours" className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="work-hours">Work Details</TabsTrigger>
						<TabsTrigger value="columns">Columns</TabsTrigger>
					</TabsList>

					<TabsContent value="work-hours" className="space-y-6">
						<div className="space-y-4">
							<div className="w-full">
								<div className="space-y-2">
									<Label htmlFor="user-name">Your Name</Label>
									<Input
										id="user-name"
										type="text"
										value={localName}
										onChange={(e) => setLocalName(e.target.value)}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="start-time">Start Time</Label>
									<Input
										id="start-time"
										type="time"
										value={localWorkTiming.startTime}
										onChange={(e) =>
											setLocalWorkTiming({
												...localWorkTiming,
												startTime: e.target.value,
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="end-time">End Time</Label>
									<Input
										id="end-time"
										type="time"
										value={localWorkTiming.endTime}
										onChange={(e) =>
											setLocalWorkTiming({
												...localWorkTiming,
												endTime: e.target.value,
											})
										}
									/>
								</div>
							</div>

							<Separator />

							<div className="space-y-3">
								<Label>Work Days</Label>
								<div className="grid grid-cols-2 gap-2">
									{DAYS_OF_WEEK.map((day) => (
										<div key={day.id} className="flex items-center space-x-2">
											<Checkbox
												id={`day-${day.id}`}
												checked={localWorkTiming.workDays.includes(day.id)}
												onCheckedChange={() => handleDayToggle(day.id)}
											/>
											<Label htmlFor={`day-${day.id}`} className="text-sm">
												{day.name}
											</Label>
										</div>
									))}
								</div>
							</div>
						</div>

						{typeof validationResult.error !== "undefined" && (
							<div className="flex items-center gap-2 w-full pt-2 text-sm text-red-600">
								<InfoIcon size={16} />{" "}
								{validationResult.error.issues[0].message}
							</div>
						)}
					</TabsContent>

					<TabsContent value="columns" className="space-y-6">
						<DndProvider backend={HTML5Backend}>
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Label>Current Columns</Label>
									<span className="text-xs text-gray-500">
										(Drag to reorder)
									</span>
								</div>
								{localColumns.map((column, index) => (
									<DraggableColumn
										key={column.id}
										column={column}
										index={index}
										moveColumn={moveColumn}
										updateColumnTitle={updateColumnTitle}
										updateColumnColor={updateColumnColor}
										updateColumnIcon={updateColumnIcon}
										deleteColumn={deleteColumn}
										isDeleteDisabled={localColumns.length <= 2}
									/>
								))}

								<Separator />

								<div className="space-y-3">
									<Label>Add New Column</Label>

									<div className="flex gap-2">
										<Select
											value={newColumnIcon}
											onValueChange={(value) => setNewColumnIcon(value)}
										>
											<SelectTrigger
												size="sm"
												chevron={false}
												className="w-8 px-1.5 justify-center cursor-pointer border-transparent hover:border-input"
											>
												<div className={COLORS_CLASSES[newColumnColor]?.text}>
													{ICON_OPTIONS.get(newColumnIcon)}
												</div>
											</SelectTrigger>
											<SelectContent className="min-w-8">
												{Array.from(ICON_OPTIONS.entries()).map(
													([name, icon]) => (
														<SelectItem key={name} value={name}>
															<div
																className={COLORS_CLASSES[newColumnColor]?.text}
															>
																{icon}
															</div>
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
										<Select
											value={newColumnColor}
											onValueChange={(value) => setNewColumnColor(value)}
										>
											<SelectTrigger
												size="sm"
												chevron={false}
												className="w-8 px-1.5 justify-center cursor-pointer border-transparent hover:border-input"
											>
												<div
													className={cn(
														`w-4 h-4 rounded`,
														COLORS_CLASSES[newColumnColor]?.card,
													)}
												/>
											</SelectTrigger>
											<SelectContent>
												{COLOR_OPTIONS.map((color) => (
													<SelectItem key={color.name} value={color.class}>
														<div className="flex item-center gap-2">
															<div
																className={cn(
																	`w-4 h-4 rounded`,
																	COLORS_CLASSES[color.class]?.card,
																)}
															/>
															{color.name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Input
											value={newColumnTitle}
											onChange={(e) => setNewColumnTitle(e.target.value)}
											placeholder="Column title..."
											className="flex-1"
											onKeyDown={(e) => e.key === "Enter" && addColumn()}
										/>
										<Button onClick={addColumn} size="sm" className="!px-2">
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						</DndProvider>
					</TabsContent>
				</Tabs>

				<div className="flex justify-end gap-2 pt-4 border-t">
					{name.length > 0 && (
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
					)}
					<Button disabled={!validationResult.success} onClick={handleSave}>
						Save Settings
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

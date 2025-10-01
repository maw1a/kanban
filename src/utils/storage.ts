import { WorkTiming } from "../types/kanban";

export function loadFromStorage<T>(
	key: string,
	defaultValue: T,
): { value: T; exists: boolean } {
	try {
		const stored = localStorage.getItem(key);
		return {
			value: stored ? JSON.parse(stored) : defaultValue,
			exists: !!stored,
		};
	} catch (error) {
		console.error(`Error loading ${key} from localStorage:`, error);
		return {
			value: defaultValue,
			exists: false,
		};
	}
}

export function saveToStorage<T>(key: string, value: T): void {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Error saving ${key} to localStorage:`, error);
	}
}

export function isWithinWorkHours(workTiming: WorkTiming): boolean {
	const now = new Date();
	const currentDay = now.getDay();
	const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

	// Check if today is a work day
	if (!workTiming.workDays.includes(currentDay)) {
		return false;
	}

	// Check if current time is within work hours
	return (
		currentTime >= workTiming.startTime && currentTime <= workTiming.endTime
	);
}

// function getWorkingDays(days: number[]) to get range of days in format [0,1,2,3,5, 7] => [[0,3],5,7]
export function getWorkingDays(
	days: number[],
): Array<[number, number] | number> {
	let ret: Array<[number, number] | number> = [];
	days.sort((a, b) => a - b);
	let start = days[0];
	let end = days[0];

	for (let i = 1; i < days.length; i++) {
		if (days[i] === end + 1) {
			end = days[i];
		} else {
			if (start === end) {
				ret.push(start);
			} else {
				ret.push([start, end]);
			}
			start = days[i];
			end = days[i];
		}
	}
	if (start === end) {
		ret.push(start);
	} else {
		ret.push([start, end]);
	}
	return ret;
}

export function shouldShowEndOfDayNotification(
	workTiming: WorkTiming,
	lastNotificationDate: string,
): boolean {
	const now = new Date();
	const today = now.toDateString();
	const currentDay = now.getDay();
	const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

	// Don't show if we already showed notification today
	if (lastNotificationDate === today) {
		return false;
	}

	// Only show on work days
	if (!workTiming.workDays.includes(currentDay)) {
		return false;
	}

	// Show notification if current time is past end time
	return currentTime >= workTiming.endTime;
}

export function getNextWorkDay(workTiming: WorkTiming): Date {
	const now = new Date();
	let nextWorkDay = new Date(now);
	nextWorkDay.setDate(nextWorkDay.getDate() + 1);

	// Find the next work day
	while (!workTiming.workDays.includes(nextWorkDay.getDay())) {
		nextWorkDay.setDate(nextWorkDay.getDate() + 1);
	}

	// Set to start of work day
	const [hours, minutes] = workTiming.startTime.split(":").map(Number);
	nextWorkDay.setHours(hours, minutes, 0, 0);

	return nextWorkDay;
}

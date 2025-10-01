import {
	CircleDashed,
	Circle,
	CircleCheckBig,
	CircleDotDashed,
	CircleDot,
	CircleSlash,
	CirclePause,
	Hexagon,
	Diamond,
	LoaderCircle,
	Pentagon,
	Squircle,
	Triangle,
} from "lucide-react";

export const DAYS_OF_WEEK = [
	{ id: 0, name: "Sunday", nm: "Sun" },
	{ id: 1, name: "Monday", nm: "Mon" },
	{ id: 2, name: "Tuesday", nm: "Tue" },
	{ id: 3, name: "Wednesday", nm: "Wed" },
	{ id: 4, name: "Thursday", nm: "Thu" },
	{ id: 5, name: "Friday", nm: "Fri" },
	{ id: 6, name: "Saturday", nm: "Sat" },
];

export const COLOR_OPTIONS = [
	{ name: "Yellow", class: "yellow" },
	{ name: "Blue", class: "blue" },
	{ name: "Green", class: "green" },
	{ name: "Red", class: "red" },
	{ name: "Purple", class: "purple" },
	{ name: "Pink", class: "pink" },
	{ name: "Indigo", class: "indigo" },
	{ name: "Orange", class: "orange" },
];

export const COLORS_CLASSES = {
	yellow: {
		column: "bg-yellow-100 border-yellow-300",
		card: "bg-yellow-300",
		button: "hover:bg-yellow-300",
		ring: "ring-yellow-300",
		text: "text-yellow-600",
	},
	blue: {
		column: "bg-blue-100 border-blue-300",
		card: "bg-blue-300",
		button: "hover:bg-blue-300",
		ring: "ring-blue-300",
		text: "text-blue-600",
	},
	green: {
		column: "bg-green-100 border-green-300",
		card: "bg-green-300",
		button: "hover:bg-green-300",
		ring: "ring-green-300",
		text: "text-green-600",
	},
	red: {
		column: "bg-red-100 border-red-300",
		card: "bg-red-300",
		button: "hover:bg-red-300",
		ring: "ring-red-300",
		text: "text-red-600",
	},
	purple: {
		column: "bg-purple-100 border-purple-300",
		card: "bg-purple-300",
		button: "hover:bg-purple-300",
		ring: "ring-purple-300",
		text: "text-purple-600",
	},
	pink: {
		column: "bg-pink-100 border-pink-300",
		card: "bg-pink-300",
		button: "hover:bg-pink-300",
		ring: "ring-pink-300",
		text: "text-pink-600",
	},
	indigo: {
		column: "bg-indigo-100 border-indigo-300",
		card: "bg-indigo-300",
		button: "hover:bg-indigo-300",
		ring: "ring-indigo-300",
		text: "text-indigo-600",
	},
	orange: {
		column: "bg-orange-100 border-orange-300",
		card: "bg-orange-300",
		button: "hover:bg-orange-300",
		ring: "ring-orange-300",
		text: "text-orange-600",
	},
};

export const ICON_OPTIONS = new Map([
	["CircleDashed", <CircleDashed size={16} strokeWidth={3} />],
	["Circle", <Circle size={16} strokeWidth={3} />],
	["CircleCheckBig", <CircleCheckBig size={16} strokeWidth={3} />],
	["CircleDotDashed", <CircleDotDashed size={16} strokeWidth={3} />],
	["CircleDot", <CircleDot size={16} strokeWidth={3} />],
	["CircleSlash", <CircleSlash size={16} strokeWidth={3} />],
	["Triangle", <Triangle size={16} strokeWidth={3} />],
	["Diamond", <Diamond size={16} strokeWidth={3} />],
	["Pentagon", <Pentagon size={16} strokeWidth={3} />],
	["Hexagon", <Hexagon size={16} strokeWidth={3} />],
]);

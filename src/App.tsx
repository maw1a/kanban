import React from "react";
import { KanbanBoard } from "./components/KanbanBoard";
import { Toaster } from "./components/ui/sonner";

export default function App() {
	return (
		<div className="font-mono">
			<KanbanBoard />
			<Toaster />
		</div>
	);
}

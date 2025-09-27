"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../src/contexts/AuthContext";
import "../src/index.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="font-sans">
				<AuthProvider>
					<div className="min-h-screen bg-gray-50">{children}</div>
					<Toaster position="top-right" />
				</AuthProvider>
			</body>
		</html>
	);
}

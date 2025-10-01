import dynamic from "next/dynamic";

// Dynamically import the React Router app to avoid SSR issues
const App = dynamic(() => import("../src/App.jsx"), {
	ssr: false,
});

export default function Home() {
	return <App />;
}

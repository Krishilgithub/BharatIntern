import dynamic from "next/dynamic";

const ReactRouterApp = dynamic(() => import("../src/App.jsx"), {
	ssr: false,
});

export default function About() {
	return <ReactRouterApp />;
}

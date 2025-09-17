import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App.jsx'), { ssr: false });

export default function CatchAllPage() {
  return <App />;
}




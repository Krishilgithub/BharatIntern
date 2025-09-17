export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">500 - Server Error</h1>
        <p className="text-gray-600">Something went wrong. Please try again later.</p>
      </div>
    </div>
  );
}


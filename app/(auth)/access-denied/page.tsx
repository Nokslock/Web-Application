import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-5">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-8">
        You do not have permission to view this page. Please log in first.
      </p>
      <Link 
        href="/login" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Login
      </Link>
    </div>
  );
}
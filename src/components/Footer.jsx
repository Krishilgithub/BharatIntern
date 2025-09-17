import React from "react";

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 mt-10">
            <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-gray-600">
                <p>© {new Date().getFullYear()} BharatIntern. All rights reserved.</p>
                <nav className="space-x-4">
                    <a className="hover:underline" href="/about">About</a>
                    <a className="hover:underline" href="/contact">Contact</a>
                    <a className="hover:underline" href="/privacy">Privacy</a>
                </nav>
            </div>
        </footer>
    );
}


import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme:dark");
        const isDark = stored ? stored === "1" : false;
        setDark(isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("theme:dark", next ? "1" : "0");
        document.documentElement.classList.toggle("dark", next);
    };

    return (
        <button onClick={toggle} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? "Light" : "Dark"}
        </button>
    );
}


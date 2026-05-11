export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {                          // ← important: extend, not replace
            colors: {
                primary: '#3b82f6',
                secondary: '#10b981',
                danger: '#ef4444',
            },
            fontFamily: {
                // Your custom Persian font – note the quotes around 'sans-serif'
                'vazir': ['Vazirmatn', 'Segoe UI', 'Tahoma', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
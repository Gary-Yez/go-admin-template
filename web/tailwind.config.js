/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@gary-yez/go-admin-web/src/**/*.{vue,js,ts}',
    ...(process.env.GO_ADMIN_WEB_SOURCE ? [process.env.GO_ADMIN_WEB_SOURCE.replaceAll('\\', '/') + '/src/**/*.{vue,js,ts}'] : [])
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


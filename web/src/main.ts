import './style.css'
import {createAdminApp, registerAdminPages} from '@gary-yez/go-admin-web'
import '@gary-yez/go-admin-web/style'
import {pages} from './pages'

createAdminApp({
    apiBaseURL: import.meta.env.VITE_API_BASE_URL,
    dev: import.meta.env.DEV,
    pages,
})

if (import.meta.hot) {
    import.meta.hot.accept('./pages', module => {
        if (module) registerAdminPages(module.pages)
    })
}

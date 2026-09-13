import './style.css'
import {createAdminApp, registerAdminPages} from '@gary-yez/go-admin-web'
import '@gary-yez/go-admin-web/style'
import {pages} from './pages'

createAdminApp({
    apiBaseURL: import.meta.env.VITE_API_BASE_URL,
    dev: import.meta.env.DEV,
    pages,
    requestHooks: {
        // 按需启用，支持 async；context 提供 pinia、router、dev。
        // beforeRequest(config, context) {
        //     const store = useYourStore(context.pinia)
        //     config.headers['X-Tenant-ID'] = store.tenantId
        //     return config
        // },
        // afterResponse(data, context) {
        //     // data 是成功的业务响应体；context.router 可用于导航。
        //     return data
        // },
    },
})

if (import.meta.hot) {
    import.meta.hot.accept('./pages', module => {
        if (module) registerAdminPages(module.pages)
    })
}

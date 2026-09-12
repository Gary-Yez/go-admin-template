import {reactive, shallowReactive} from "vue";

type ComponentLoader = () => Promise<unknown>
type ComponentModules = Record<string, ComponentLoader>

const core = import.meta.glob('../core/views/**/*.vue')
const layouts = import.meta.glob('../layouts/**/*.vue')
const views = import.meta.glob('../views/**/*.vue')

// 热更新时复用对象，保持路由和组件选择列表的引用有效。
const modules = import.meta.hot?.data.modules || {
    core: shallowReactive<ComponentModules>({}),
    layouts: shallowReactive<ComponentModules>({}),
    views: shallowReactive<ComponentModules>({}),
    components: reactive<string[]>([]),
}

const updateModules = (target:ComponentModules, source:ComponentModules)=>{
    Object.keys(target).forEach(key=>{
        if (!source[key]) delete target[key]
    })
    Object.assign(target,source)
}

updateModules(modules.core,core)
updateModules(modules.layouts,layouts)
updateModules(modules.views,views)
const components = Object.keys(views).sort()
if (JSON.stringify(modules.components) !== JSON.stringify(components)){
    modules.components.splice(0,modules.components.length,...components)
}

export const coreModules:ComponentModules = modules.core
export const layoutsModules:ComponentModules = modules.layouts
export const viewModules:ComponentModules = modules.views
export const SyncComponents:string[] = modules.components

if (import.meta.hot){
    import.meta.hot.data.modules = modules
    // 新增、删除页面时只更新组件清单，避免触发整页刷新。
    import.meta.hot.accept()
}

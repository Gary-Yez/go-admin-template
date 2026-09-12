import type {Component} from "vue"
export const pages = import.meta.glob<{default: Component}>("./views/**/*.vue")

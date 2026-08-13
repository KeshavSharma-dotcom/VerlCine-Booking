import React, { type ReactNode } from "react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { store } from "./store.ts"

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </Provider>
    )
}
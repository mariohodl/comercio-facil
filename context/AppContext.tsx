'use client'
import React, { useState } from 'react'
export const AppContext = React.createContext({})

export default function AppContextProvider ({children}: {children: React.ReactNode}) {
    const [spinner, setSpinner] = useState(false)
    const [showModalError, setShowModalError] = useState(false)

    const obj = {
        spinner,
        setSpinner,
        showModalError,
        setShowModalError,
    }

    return (<AppContext.Provider value={obj}>
        {children}
    </AppContext.Provider>)
}
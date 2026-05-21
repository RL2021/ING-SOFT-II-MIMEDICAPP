import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Check active sessions on initial page load
		const initializeAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			setUser(session?.user ?? null)
			setLoading(false)
		}

		initializeAuth()

		// Listen for auth events
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null)
			setLoading(false)
		})

		// Clean up listener when the component unmounts
		return () => {
			subscription.unsubscribe()
		}
	}, [])

	// Wrap Supabase auth functions
	const signUp = async (name, birthDate, phone, email, password) => {
		const { data, error: authError } = await supabase.auth.signUp({
			email,
			password,
		})
		if (authError) {
			console.error("Auth Error:", authError.message)
			return
		}

		const userId = data?.user?.id
		const { error: dbError } = await supabase.from("users").insert({
			id: userId,
			name: name,
			birth_date: birthDate,
			phone: phone,
			email: email,
		})

		if (dbError) {
			console.error("Database Error:", dbError.message)
			return
		}
	}
	const signIn = (email, password) =>
		supabase.auth.signInWithPassword({ email, password })
	const signOut = () => supabase.auth.signOut()

	const value = {
		user,
		signUp,
		signIn,
		signOut,
		loading,
	}

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	)
}

// Custom hook
export const useAuth = () => {
	return useContext(AuthContext)
}

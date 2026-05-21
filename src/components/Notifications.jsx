import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import DashboardMenu from "./DashboardMenu"

export default function Notifications() {
	const [notifs, setNotifs] = useState([])

	useEffect(() => {
		async function getNotifs() {
			let { data: notifications, error: fetchErr } = await supabase
				.from("notifications")
				.select("*")

			if (notifications) {
				setNotifs(notifications)
			}

			if (fetchErr) {
				console.error(fetchErr.message)
			}
		}
		getNotifs()
	}, [])

	return (
		<div className="text-center">
			{/* <DashboardMenu /> */}
			{notifs.length === 0 && <div>No hay notificaciones :(</div>}

			{!notifs.length === 0 && (
				<ul>
					{notifs.map((noti) => (
						<li key={noti.id}>{noti.title}</li>
					))}
				</ul>
			)}
		</div>
	)
}

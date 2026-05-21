import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import DashboardMenu from "./DashboardMenu"
import {
	Bell,
	CalendarClock,
	CheckCircle2,
	ChevronLeft,
	Clock3,
	Edit3,
	MapPin,
	NotebookText,
	Plus,
	Stethoscope,
	Trash2,
	UserRound,
	X,
} from "lucide-react"

export default function Notifications() {
	const [notifs, setNotifs] = useState([
		{
			id: 700,
			title: "title",
			message: "message",
			type: "exercise",
			scheduled_for: new Date(Date.now()).toString(),
			is_read: false,
		},
		{
			id: 800,
			title: "title2",
			message: "message2",
			type: "appointment",
			scheduled_for: new Date(Date.now() * 100).toString(),
			is_read: true,
		},
	])

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
		// getNotifs()
	}, [])

	return (
		<>
			{notifs.length === 0 && <div>No hay notificaciones :(</div>}

			{notifs.length !== 0 && (
				<section className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 lg:p-8">
					<div>
						<div>
							<p className="text-sm font-black uppercase tracking-wide text-skysoft-500">
								Historial
							</p>
							<h2 className="mt-1 text-2xl font-black text-plum-800">
								Tus Notificaciones
							</h2>
						</div>
					</div>

					<div className="mt-6 grid w-full gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{notifs.map((noti) => (
							<article
								key={noti.id}
								className={`flex min-h-72 w-full flex-col rounded-3xl border-2 p-5 shadow-sm transition hover:shadow-soft ${
									noti.is_read ?
										"border-mint-100 bg-mint-100/50 hover:border-mint-500"
									:	"border-plum-100 bg-white hover:border-skysoft-500"
								}`}
							>
								<div className="mb-5 flex items-start justify-between gap-4">
									<div className="flex flex-wrap justify-end gap-2">
										{noti.is_read && (
											<span className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3 py-2 text-xs font-black text-mint-500">
												<CheckCircle2
													className="h-4 w-4"
													aria-hidden="true"
												/>
												Leida
											</span>
										)}
										<span className="inline-flex items-center gap-2 rounded-full bg-lotus-100 px-3 py-2 text-xs font-black text-lotus-500">
											<Bell
												className="h-4 w-4"
												aria-hidden="true"
											/>
											Aviso
										</span>
									</div>
								</div>

								<h3 className="text-xl font-black leading-tight text-plum-800">
									{noti.title}
								</h3>

								<div className="mt-auto pt-5 grid gap-3 text-sm font-semibold text-plum-600">
									<p className="flex items-start gap-2">
										<CalendarClock
											className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500"
											aria-hidden="true"
										/>
										{noti.scheduled_for.toString()}
									</p>
									<p className="flex items-start gap-2">
										<NotebookText
											className="mt-0.5 h-4 w-4 shrink-0 text-lotus-500"
											aria-hidden="true"
										/>
										{noti.message}
									</p>
								</div>
							</article>
						))}
					</div>
				</section>
			)}
		</>
	)
}

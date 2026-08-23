import { ImageResponse } from "next/og";

export const alt = "CampusLoop — Your Verified Campus Social Network";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #09090b 0%, #1c1023 55%, #2a1230 100%)",
					fontFamily: "sans-serif",
				}}
			>
				{/* Ambient glows */}
				<div
					style={{
						position: "absolute",
						top: -160,
						right: -120,
						width: 520,
						height: 520,
						borderRadius: 999,
						background: "radial-gradient(circle, rgba(249,115,22,0.28), transparent 70%)",
						display: "flex",
					}}
				/>
				<div
					style={{
						position: "absolute",
						bottom: -180,
						left: -140,
						width: 560,
						height: 560,
						borderRadius: 999,
						background: "radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)",
						display: "flex",
					}}
				/>

				{/* Brand row */}
				<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
					<div
						style={{
							width: 96,
							height: 96,
							borderRadius: 26,
							background: "linear-gradient(135deg, #f97316, #ea580c)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 12px 40px rgba(249,115,22,0.45)",
						}}
					>
						<div
							style={{
								width: 52,
								height: 52,
								borderRadius: 16,
								background: "#ffffff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 34,
								fontWeight: 900,
								color: "#ea580c",
							}}
						>
							C
						</div>
					</div>
					<div style={{ fontSize: 88, fontWeight: 900, color: "#fafafa", letterSpacing: -2, display: "flex" }}>
						CampusLoop
					</div>
				</div>

				{/* Tagline */}
				<div
					style={{
						marginTop: 36,
						fontSize: 40,
						fontWeight: 600,
						color: "rgba(250,250,250,0.85)",
						display: "flex",
					}}
				>
					Your Verified Campus Social Network
				</div>

				{/* Stat chips */}
				<div style={{ display: "flex", gap: 20, marginTop: 56 }}>
					{["1,350+ Campuses", "Verified Students Only", "Anonymous Confessions"].map((chip) => (
						<div
							key={chip}
							style={{
								display: "flex",
								padding: "14px 30px",
								borderRadius: 999,
								border: "1px solid rgba(255,255,255,0.18)",
								background: "rgba(255,255,255,0.07)",
								color: "#e4e4e7",
								fontSize: 26,
								fontWeight: 600,
							}}
						>
							{chip}
						</div>
					))}
				</div>

				{/* Domain */}
				<div
					style={{
						position: "absolute",
						bottom: 44,
						fontSize: 24,
						color: "rgba(250,250,250,0.5)",
						letterSpacing: 2,
						display: "flex",
					}}
				>
					campusloop.space
				</div>
			</div>
		),
		size
	);
}

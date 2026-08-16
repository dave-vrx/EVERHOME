import type {Metadata} from "next";import "./globals.css";import "./lake.css";
export const metadata:Metadata={title:"EVERHOME — Imagine it. Make it real.",description:"Build worlds, make games, meet friends, and explore a universe made by everyone."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

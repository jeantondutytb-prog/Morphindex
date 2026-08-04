import { Archivo, Bricolage_Grotesque, JetBrains_Mono, Instrument_Serif } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700", "800"], variable: "--f-display" });
const sans    = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--f-sans" });
const mono    = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono" });
const serif   = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["italic"], variable: "--f-serif" });

export const fontVars = [display.variable, sans.variable, mono.variable, serif.variable].join(" ");

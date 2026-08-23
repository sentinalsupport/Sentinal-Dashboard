"use client";
import * as React from "react";
export function ThemeProvider({children}:{children:React.ReactNode}){
  const [theme,setTheme]=React.useState<"light"|"dark">("dark");
  React.useEffect(()=>{
    const s=localStorage.getItem("theme") as "light"|"dark"|null;
    if(s) setTheme(s);
    document.documentElement.classList.toggle("dark", (s||"dark")==="dark");
  },[]);
  const toggle=()=>{
    const n=theme==="dark"?"light":"dark";
    setTheme(n); localStorage.setItem("theme",n);
    document.documentElement.classList.toggle("dark", n==="dark");
  };
  return <ThemeContext.Provider value={{theme,toggle}}>{children}</ThemeContext.Provider>;
}
export const ThemeContext=React.createContext<{theme:string; toggle:()=>void}>({theme:"dark", toggle:()=>{}});

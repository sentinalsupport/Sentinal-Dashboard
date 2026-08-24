"use client";
import { useEffect } from "react";

export default function Home(){
  useEffect(()=>{
    // Load sentinel landing HTML via fetch and replace body content for full fidelity
    fetch("/sentinel-landing.html").then(r=>r.text()).then(html=>{
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      // inject styles
      const styles = doc.querySelectorAll("style");
      styles.forEach(s=>{
        const el = document.createElement("style");
        el.textContent = s.textContent;
        document.head.appendChild(el);
      });
      // replace body
      const bodyContent = doc.body.innerHTML;
      const container = document.getElementById("sentinel-landing-container");
      if(container) {
        container.innerHTML = bodyContent;
        // re-run scripts
        const scripts = doc.querySelectorAll("script");
        scripts.forEach(old=>{
          const s = document.createElement("script");
          s.textContent = old.textContent;
          document.body.appendChild(s);
        });
      }
    });
  },[]);
  return <div id="sentinel-landing-container" style={{minHeight:"100vh", background:"#07090e"}} />;
}

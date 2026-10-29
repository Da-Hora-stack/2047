import { useEffect,useState } from 'react';
export default function DialogueText({text}){const [n,setN]=useState(0);useEffect(()=>{setN(0);const timer=setInterval(()=>setN(v=>Math.min(text.length,v+3)),25);return()=>clearInterval(timer);},[text]);return <p className="transmission" aria-label={text}>{text.slice(0,n)}<span aria-hidden="true">{n<text.length?'▏':''}</span></p>;}

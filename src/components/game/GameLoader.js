'use client';
import dynamic from 'next/dynamic';
import { TEXT } from '../../data/pt-BR.js';
const GameView=dynamic(()=>import('./GameView.js'),{ssr:false,loading:()=> <main className="boot"><span className="spinner"/><p>{TEXT.loading}</p></main>});
export default function GameLoader(props){return <GameView {...props}/>;}

'use client';
import dynamic from 'next/dynamic';
const Citizen=dynamic(()=>import('../../components/Citizen'),{ssr:false});
export default function Page(){return <Citizen/>}

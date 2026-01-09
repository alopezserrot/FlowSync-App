
import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { USERS, VENDORS, RESTAURANTS, ORDERS, BOARD_TEMPLATES, MENU_ITEM_TEMPLATES, MENU_TEMPLATES, INGREDIENTS, PRODUCTION_SPACES, PROMOTIONS } from '../data';
import { XIcon, XCircleIcon } from './Shared';
import { MediaType } from '../types';

// Comprehensive list of all structures/collections used in the app
const ALL_COLLECTIONS = [
    "users", 
    "vendors", 
    "restaurants", 
    "orders", 
    "boardTemplates", 
    "menuTemplates", 
    "menuItemTemplates", 
    "ingredients", 
    "productionSpaces", 
    "promotions"
];

export const DatabaseSeeder: React.FC = () => {
    const [status, setStatus] = useState('Idle');
    const [step, setStep] = useState<'initial' | 'confirm_seed' | 'confirm_wipe' | 'seeding' | 'done' | 'closed'>('initial');
    const [error, setError] = useState<string | null>(null);

    const wipeAndSeed = async (shouldWipe: boolean) => {
        setStep('seeding');
        setStatus('Initializing Reset...');
        setError(null);

        try {
            console.log(`Seeder: Initializing... Total Wipe: ${shouldWipe}`);
            
            // Sign out to prevent session conflicts with purged users
            try { await signOut(auth); } catch(e) { console.log("Sign out skipped", e); }

            // 1. TOTAL PURGE PHASE
            if (shouldWipe) {
                setStatus('CLEANING DATABASE...');
                for (const colName of ALL_COLLECTIONS) {
                    setStatus(`Purging: ${colName}...`);
                    const querySnapshot = await getDocs(collection(db, colName));
                    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
                    await Promise.all(deletePromises);
                }
                setStatus('DATABASE TOTALLY CLEAN');
            }

            // 2. RE-SEED PHASE (Populating the empty structures)
            
            // Vendors
            setStatus('Re-populating Vendors...');
            for (const v of VENDORS) {
                await setDoc(doc(db, "vendors", v.id.toString()), v);
            }

            // Users & Auth
            setStatus('Setting up Auth & Users...');
            for (const u of USERS) {
                const { password, ...userData } = u;
                await setDoc(doc(db, "users", u.id.toString()), userData);
                
                if (u.password) {
                    try {
                        const email = `${u.username}@flowapp.test`;
                        await createUserWithEmailAndPassword(auth, email, u.password);
                    } catch (e: any) {
                        if (e.code !== 'auth/email-already-in-use') {
                            console.error(`Auth Error for ${u.username}`, e);
                        }
                    }
                }
            }

            // Restaurants (Enhanced with Multimedia and complex configuration)
            setStatus('Seeding Restaurants with Config...');
            for (const r of RESTAURANTS) {
                // We enrich the data from constants with more media types for better testing of the new UI
                const enrichedRestaurant = {
                    ...r,
                    media: [
                        ...(r.media || []),
                        {
                            id: Date.now() + Math.random(),
                            type: MediaType.Image,
                            title: 'Our Signature View',
                            source: 'https://picsum.photos/800/600?random=101',
                            description: 'A look at our dining hall.'
                        },
                        {
                            id: Date.now() + Math.random(),
                            type: MediaType.Link,
                            title: 'Official Website',
                            source: 'https://example.com',
                            description: 'Visit our main site for events.'
                        }
                    ]
                };
                await setDoc(doc(db, "restaurants", r.id.toString()), enrichedRestaurant);
            }

            // Orders
            setStatus('Restoring Order History...');
            for (const o of ORDERS) {
                await setDoc(doc(db, "orders", o.id.toString()), o);
            }

            // Core Templates
            setStatus('Deploying Templates...');
            for (const t of BOARD_TEMPLATES) await setDoc(doc(db, "boardTemplates", t.id.toString()), t);
            for (const t of MENU_TEMPLATES) await setDoc(doc(db, "menuTemplates", t.id.toString()), t);
            for (const t of MENU_ITEM_TEMPLATES) await setDoc(doc(db, "menuItemTemplates", t.id.toString()), t);

            // Inventory & Ops
            setStatus('Finalizing Data Seed...');
            for (const i of INGREDIENTS) await setDoc(doc(db, "ingredients", i.id), i);
            for (const p of PRODUCTION_SPACES) await setDoc(doc(db, "productionSpaces", p.id), p);
            for (const p of PROMOTIONS) await setDoc(doc(db, "promotions", p.id), p);

            setStatus('SUCCESS! RELOADING...');
            setStep('done');
            window.location.reload();
        } catch (error: any) {
            console.error("Critical Seeding Error:", error);
            setStatus(`CRITICAL ERROR: ${error.message}`);
            setError(error.message);
            setStep('initial');
        }
    };

    if (step === 'done' || step === 'closed') return null;

    return (
        <div className="fixed bottom-6 left-6 z-[100] animate-fade-in">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 w-80 relative overflow-hidden">
                <button 
                    onClick={() => setStep('closed')}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-gray-500 hover:text-white transition-all z-10"
                >
                    <XIcon className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3 mb-5 border-b border-slate-800 pb-4">
                    <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 leading-none mb-1">Super Admin</h4>
                        <p className="font-bold text-sm text-white">Config Seed Engine</p>
                    </div>
                </div>
                
                {step === 'initial' && (
                    <div className="space-y-3">
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                            Wipe and rebuild the system with the latest configuration structures (multimedia, branding, and permissions).
                        </p>
                        <button 
                            onClick={() => setStep('confirm_seed')} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            Sync Current Config
                        </button>
                        <button 
                            onClick={() => setStep('confirm_wipe')} 
                            className="w-full bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all active:scale-95"
                        >
                            Hard Reset (Full Data Wipe)
                        </button>
                    </div>
                )}

                {step === 'confirm_seed' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <p className="text-xs text-blue-200 font-medium">
                                Update existing entries with new multimedia and branding structures.
                            </p>
                        </div>
                        <div className="flex space-x-2">
                             <button onClick={() => setStep('initial')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors">Cancel</button>
                             <button onClick={() => wipeAndSeed(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg">Proceed</button>
                        </div>
                    </div>
                )}

                {step === 'confirm_wipe' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                            <p className="text-xs text-red-200 font-bold uppercase tracking-tight">
                                Full Cleanup:
                            </p>
                            <p className="text-[11px] text-red-300 mt-1">
                                This will purge every collection and rebuild with factory defaults.
                            </p>
                        </div>
                        <div className="flex space-x-2">
                             <button onClick={() => setStep('initial')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors">Cancel</button>
                             <button onClick={() => wipeAndSeed(true)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg">Wipe & Sync</button>
                        </div>
                    </div>
                )}

                {step === 'seeding' && (
                    <div className="text-center py-6 space-y-4">
                        <div className="relative flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary shadow-inner"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary tracking-[0.2em] uppercase animate-pulse">
                                Rebuilding DB
                            </p>
                            <p className="text-xs font-mono text-gray-300 truncate px-2">{status}</p>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="mt-4 bg-red-950 p-4 rounded-xl border border-red-900 animate-shake">
                        <div className="flex items-center space-x-2 mb-2">
                            <XCircleIcon className="w-4 h-4 text-red-500" />
                            <p className="text-xs font-bold text-red-200 uppercase tracking-tighter">Process Failed</p>
                        </div>
                        <p className="text-[10px] text-red-300 font-mono leading-relaxed opacity-80">{error}</p>
                        <button onClick={() => setStep('initial')} className="mt-3 w-full text-[10px] font-black text-white bg-red-600/20 hover:bg-red-600 py-2 rounded-lg transition-all uppercase">Retry Seeding</button>
                    </div>
                )}
            </div>
        </div>
    );
};

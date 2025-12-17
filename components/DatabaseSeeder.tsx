
import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { USERS, VENDORS, RESTAURANTS, ORDERS, BOARD_TEMPLATES, MENU_ITEM_TEMPLATES, MENU_TEMPLATES, INGREDIENTS, PRODUCTION_SPACES, PROMOTIONS } from '../data';

export const DatabaseSeeder: React.FC = () => {
    const [status, setStatus] = useState('Idle');
    const [step, setStep] = useState<'initial' | 'confirm' | 'seeding' | 'done'>('initial');
    const [error, setError] = useState<string | null>(null);

    const startSeeding = async () => {
        setStep('seeding');
        setStatus('Initializing...');
        setError(null);

        try {
            console.log("Seeder: Starting process...");
            
            // Optional: Sign out first to avoid auth state conflicts during loop
            try { await signOut(auth); } catch(e) { console.log("Sign out skipped", e); }

            // 1. Seed Vendors
            setStatus('Seeding Vendors...');
            for (const v of VENDORS) {
                await setDoc(doc(db, "vendors", v.id.toString()), v);
            }

            // 2. Seed Users & Create Auth Accounts
            setStatus('Seeding Users & Auth...');
            for (const u of USERS) {
                const { password, ...userData } = u;
                await setDoc(doc(db, "users", u.id.toString()), userData);
                
                if (u.password) {
                    try {
                        const email = `${u.username}@flowapp.test`;
                        // Note: This signs you in as the last created user.
                        await createUserWithEmailAndPassword(auth, email, u.password);
                        console.log(`Created auth for ${u.username}`);
                    } catch (e: any) {
                        if (e.code === 'auth/email-already-in-use') {
                            console.log(`User ${u.username} already exists (skipping auth creation)`);
                        } else {
                            console.error(`Failed to create auth for ${u.username}`, e);
                        }
                    }
                }
            }

            // 3. Seed Restaurants
            setStatus('Seeding Restaurants...');
            for (const r of RESTAURANTS) {
                await setDoc(doc(db, "restaurants", r.id.toString()), r);
            }

            // 4. Seed Orders
            setStatus('Seeding Orders...');
            for (const o of ORDERS) {
                await setDoc(doc(db, "orders", o.id.toString()), o);
            }

            // 5. Seed Templates
            setStatus('Seeding Templates...');
            for (const t of BOARD_TEMPLATES) await setDoc(doc(db, "boardTemplates", t.id.toString()), t);
            for (const t of MENU_TEMPLATES) await setDoc(doc(db, "menuTemplates", t.id.toString()), t);
            for (const t of MENU_ITEM_TEMPLATES) await setDoc(doc(db, "menuItemTemplates", t.id.toString()), t);

            // 6. Inventory & POS
            setStatus('Seeding Inventory & Spaces...');
            for (const i of INGREDIENTS) await setDoc(doc(db, "ingredients", i.id), i);
            for (const p of PRODUCTION_SPACES) await setDoc(doc(db, "productionSpaces", p.id), p);
            for (const p of PROMOTIONS) await setDoc(doc(db, "promotions", p.id), p);

            setStatus('Done! Refresh page.');
            setStep('done');
            alert("Database population complete! You can now log in.");
            window.location.reload(); // Reload to reset app state with new data
        } catch (error: any) {
            console.error("Seeding Error:", error);
            setStatus(`Error: ${error.message}`);
            setError(error.message);
            setStep('initial');
        }
    };

    if (step === 'done') return null;

    return (
        <div className="fixed bottom-4 left-4 z-[100]">
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl border border-gray-600 w-72">
                <h4 className="font-bold mb-2 text-yellow-400">⚠️ Admin: Database Setup</h4>
                
                {step === 'initial' && (
                    <>
                        <p className="text-xs text-gray-300 mb-3">
                            Click below to populate Firestore with sample data.
                        </p>
                        <button 
                            onClick={() => setStep('confirm')} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
                        >
                            Seed Database
                        </button>
                    </>
                )}

                {step === 'confirm' && (
                    <div className="animate-fade-in-down">
                        <p className="text-xs text-red-300 mb-3 font-bold border-l-2 border-red-500 pl-2">
                            This will overwrite existing data. Are you sure?
                        </p>
                        <div className="flex space-x-2">
                             <button 
                                onClick={() => setStep('initial')} 
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={startSeeding} 
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-sm"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {step === 'seeding' && (
                    <div className="text-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                        <span className="text-xs font-mono block text-blue-300">{status}</span>
                    </div>
                )}
                
                {error && (
                    <div className="mt-2 bg-red-900/50 p-2 rounded border border-red-500">
                        <p className="text-xs text-red-200 break-words">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

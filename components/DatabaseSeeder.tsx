
import React from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, writeBatch, doc } from "firebase/firestore"; 
import { db } from '../firebaseConfig';
// Corrected import path from '../seedData' to '../data'
import { restaurants, menuTemplates, ingredients, items as menuItems, promotions, users } from '../data';

const collections = [
    { name: 'restaurants', data: restaurants },
    { name: 'menus', data: menuTemplates },
    { name: 'ingredients', data: ingredients },
    { name: 'items', data: menuItems },
    { name: 'promotions', data: promotions },
    { name: 'users', data: users },
];

export const DatabaseSeeder: React.FC = () => {
    const { t } = useTranslation();

    const handleSeed = async () => {
        if (!window.confirm(t('confirm_seed'))) return;

        try {
            for (const { name, data } of collections) {
                console.log(`Seeding ${name}...`);
                const batch = writeBatch(db);
                data.forEach((item: any) => {
                    const docRef = doc(db, name, item.id.toString()); 
                    batch.set(docRef, item);
                });
                await batch.commit();
                console.log(`${name} seeded successfully!`);
            }
            alert(t('seed_success'));
        } catch (error) {
            console.error("Error seeding database: ", error);
            alert(t('seed_error'));
        }
    };

    const handleClear = async () => {
        if (!window.confirm(t('confirm_clear'))) return;

        try {
            for (const { name } of collections) {
                console.log(`Clearing ${name}...`);
                const querySnapshot = await getDocs(collection(db, name));
                const batch = writeBatch(db);
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`${name} cleared successfully!`);
            }
            alert(t('clear_success'));
        } catch (error) {
            console.error("Error clearing database: ", error);
            alert(t('clear_error'));
        }
    };

    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">{t('dev_tools')}</h1>
            <p className="mb-6">{t('dev_tools_desc')}</p>
            <div className="flex justify-center space-x-4">
                <button onClick={handleSeed} className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold">{t('seed_database')}</button>
                <button onClick={handleClear} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">{t('clear_database')}</button>
            </div>
        </div>
    );
};

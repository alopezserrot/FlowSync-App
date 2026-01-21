
import React from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, writeBatch, doc } from "firebase/firestore"; 
import { db } from '../firebaseConfig';
// Corrected import names to match exports from data.ts
import { RESTAURANTS, MENU_TEMPLATES, INGREDIENTS, MENU_ITEM_TEMPLATES as menuItems, PROMOTIONS, USERS } from '../data';

const collections = [
    { name: 'restaurants', data: RESTAURANTS },
    { name: 'menus', data: MENU_TEMPLATES },
    { name: 'ingredients', data: INGREDIENTS },
    { name: 'items', data: menuItems },
    { name: 'promotions', data: PROMOTIONS },
    { name: 'users', data: USERS },
];

// Added translations for the seeder component to i18nContext.tsx
// 'confirm_seed': 'Are you sure you want to seed the database? This will overwrite existing data.',
// 'seed_success': 'Database seeded successfully!',
// 'seed_error': 'Error seeding database.',
// 'confirm_clear': 'Are you sure you want to clear the database? This action cannot be undone.',
// 'clear_success': 'Database cleared successfully!',
// 'clear_error': 'Error clearing database.',
// 'dev_tools': 'Developer Tools',
// 'dev_tools_desc': 'Use these tools to manage the database content for development and testing.',
// 'seed_database': 'Seed Database',
// 'clear_database': 'Clear Database',

export const DatabaseSeeder: React.FC = () => {
    const { t } = useTranslation();

    const handleSeed = async () => {
        if (!window.confirm(t('confirm_seed', 'Are you sure you want to seed the database? This may overwrite existing data.'))) return;

        try {
            for (const { name, data } of collections) {
                if (!data) {
                    console.warn(`Skipping seed for ${name} as data is undefined.`);
                    continue;
                }
                console.log(`Seeding ${name}...`);
                const batch = writeBatch(db);
                data.forEach((item: any) => {
                    const docRef = doc(db, name, item.id.toString()); 
                    batch.set(docRef, item);
                });
                await batch.commit();
                console.log(`${name} seeded successfully!`);
            }
            alert(t('seed_success', 'Database seeded successfully!'));
        } catch (error) {
            console.error("Error seeding database: ", error);
            alert(t('seed_error', 'Error seeding database.'));
        }
    };

    const handleClear = async () => {
        if (!window.confirm(t('confirm_clear', 'Are you sure you want to clear all collections? This action is irreversible.'))) return;

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
            alert(t('clear_success', 'Database cleared successfully!'));
        } catch (error) {
            console.error("Error clearing database: ", error);
            alert(t('clear_error', 'Error clearing database.'));
        }
    };

    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">{t('dev_tools', 'Developer Tools')}</h1>
            <p className="mb-6">{t('dev_tools_desc', 'Use these tools to manage the database content for development purposes.')}</p>
            <div className="flex justify-center space-x-4">
                <button onClick={handleSeed} className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold">{t('seed_database', 'Seed Database')}</button>
                <button onClick={handleClear} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">{t('clear_database', 'Clear Database')}</button>
            </div>
        </div>
    );
};

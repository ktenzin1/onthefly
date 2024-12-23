import { pool } from './database.js'
import './dotenv.js'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import fs from 'fs'

const currentPath = fileURLToPath(import.meta.url)
const tripsFile = fs.readFileSync(path.join(dirname(currentPath), '../config/data/data.json'))
const tripsData = JSON.parse(tripsFile)

const createTripsTable = async () => {
    const createTripsTableQuery = `
        CREATE TABLE IF NOT EXISTS trips (
            id serial PRIMARY KEY,
            title varchar(100) NOT NULL,
            description varchar(500) NOT NULL,
            img_url text NOT NULL,
            num_days integer NOT NULL,
            start_date date NOT NULL,
            end_date date NOT NULL,
            total_cost money NOT NULL
        );
    `;

    try {
        const res = await pool.query(createTripsTableQuery);  // Execute the query here
        console.log('🎉 trips table created successfully');
    } catch (err) {
        console.error('⚠️ error creating trips table', err);
    }
};

const seedTripsTable = async () => {
    await createTripsTable();  // Ensure table is created first

    tripsData.forEach((trip) => {
        const insertQuery = {
            text: 'INSERT INTO trips (title, description, img_url, num_days, start_date, end_date, total_cost) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            values: [
                trip.title,
                trip.description,
                trip.img_url,
                trip.num_days,
                trip.start_date,
                trip.end_date,
                trip.total_cost
            ]
        };

        pool.query(insertQuery, (err, res) => {
            if (err) {
                console.error('⚠️ error inserting trip', err);
                return;
            }
            console.log(`✅ ${trip.title} added successfully`);
        });
    });
};

const createDestinationsTable = async () => {
    const createDestinationsTableQuery = `
        CREATE TABLE IF NOT EXISTS destinations (
            id serial PRIMARY KEY,
            destination varchar(100) NOT NULL,
            description varchar(500) NOT NULL,
            city varchar(100) NOT NULL,
            country varchar(100) NOT NULL,
            img_url text NOT NULL,
            flag_img_url text NOT NULL
        );
    `;

    try {
        const res = await pool.query(createDestinationsTableQuery);
        console.log('🎉 destinations table created successfully');
    } catch (err) {
        console.error('⚠️ error creating destinations table', err);
    }
};

const createActivitiesTable = async () => {
    const createActivitiesTableQuery = `
        CREATE TABLE IF NOT EXISTS activities (
            id serial PRIMARY KEY,
            trip_id int NOT NULL,
            activity varchar(100) NOT NULL,
            num_votes integer DEFAULT 0,
            FOREIGN KEY(trip_id) REFERENCES trips(id)
        );
    `;

    try {
        const res = await pool.query(createActivitiesTableQuery);
        console.log('🎉 activities table created successfully');
    } catch (err) {
        console.error('⚠️ error creating activities table', err);
    }
};

// Call the functions to create tables and seed data
seedTripsTable();
createDestinationsTable();
createActivitiesTable();

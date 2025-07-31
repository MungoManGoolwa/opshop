#!/usr/bin/env node

import fs from 'fs';
import { Pool } from 'pg';
import csv from 'csv-parser';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importLocations() {
  console.log('Starting Australian locations import...');
  
  try {
    // Clear existing locations
    await pool.query('DELETE FROM australian_locations');
    console.log('Cleared existing locations');

    const locations = [];
    let count = 0;
    
    // Read and parse CSV
    return new Promise((resolve, reject) => {
      fs.createReadStream('./attached_assets/australian_postcodes_1753922591870.csv')
        .pipe(csv())
        .on('data', (row) => {
          // Skip empty or invalid rows
          if (!row.postcode || !row.locality || !row.state) {
            return;
          }

          locations.push({
            postcode: row.postcode?.toString().trim(),
            locality: row.locality?.toString().trim(),
            state: row.state?.toString().trim(),
            latitude: row.Lat_precise && row.Lat_precise !== '0' ? parseFloat(row.Lat_precise) : null,
            longitude: row.Long_precise && row.Long_precise !== '0' ? parseFloat(row.Long_precise) : null,
            type: row.type?.toString().trim() || null,
            status: row.status?.toString().trim() || null,
            region: row.region?.toString().trim() || null,
            sa3Name: row.sa3name?.toString().trim() || null,
            sa4Name: row.sa4name?.toString().trim() || null,
          });

          count++;
          if (count % 1000 === 0) {
            console.log(`Processed ${count} records...`);
          }
        })
        .on('end', async () => {
          try {
            console.log(`Total records to import: ${locations.length}`);
            
            // Batch insert locations
            const batchSize = 500;
            for (let i = 0; i < locations.length; i += batchSize) {
              const batch = locations.slice(i, i + batchSize);
              
              const values = batch.map(loc => [
                loc.postcode,
                loc.locality,
                loc.state,
                loc.latitude,
                loc.longitude,
                loc.type,
                loc.status,
                loc.region,
                loc.sa3Name,
                loc.sa4Name
              ]);

              const placeholders = values.map((_, index) => {
                const start = index * 10 + 1;
                return `($${start}, $${start + 1}, $${start + 2}, $${start + 3}, $${start + 4}, $${start + 5}, $${start + 6}, $${start + 7}, $${start + 8}, $${start + 9})`;
              }).join(', ');

              const flatValues = values.flat();

              const insertQuery = `
                INSERT INTO australian_locations 
                (postcode, locality, state, latitude, longitude, type, status, region, sa3_name, sa4_name)
                VALUES ${placeholders}
              `;

              await pool.query(insertQuery, flatValues);
              console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(locations.length / batchSize)}`);
            }

            console.log(`Successfully imported ${locations.length} Australian locations!`);
            
            // Show some statistics
            const stats = await pool.query(`
              SELECT state, COUNT(*) as count 
              FROM australian_locations 
              GROUP BY state 
              ORDER BY count DESC
            `);
            
            console.log('\nLocations by state:');
            stats.rows.forEach(row => {
              console.log(`${row.state}: ${row.count} locations`);
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('Error importing locations:', error);
    throw error;
  }
}

// Run the import
importLocations()
  .then(() => {
    console.log('Import completed successfully!');
  })
  .catch((error) => {
    console.error('Import failed:', error);
  })
  .finally(() => {
    pool.end().then(() => {
      process.exit(0);
    });
  });
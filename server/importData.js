const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const exportDir = path.join(__dirname, 'data/mongodb-export');

// Helper to convert 24-char hex strings to ObjectIds recursively
function castObjectIds(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(castObjectIds);
  }
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
      result[key] = new mongoose.Types.ObjectId(value);
    } else if (typeof value === 'object') {
      result[key] = castObjectIds(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function importData() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not found in .env');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected!');

    const files = fs.readdirSync(exportDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(exportDir, file);
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const rawData = JSON.parse(fileContent);

      if (Array.isArray(rawData) && rawData.length > 0) {
        const data = castObjectIds(rawData);
        
        // Clear existing data
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        // Insert new data
        await mongoose.connection.db.collection(collectionName).insertMany(data);
        console.log(`✅ Imported ${data.length} records into '${collectionName}' collection`);
      } else {
        console.log(`⚠️ Skipped '${collectionName}' (file is empty or not an array)`);
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    mongoose.disconnect();
  }
}

importData();

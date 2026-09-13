import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://gaborodriguezsanchez_db_user:vDCQQ4UonLqXSqhk@cluster0.toiimzb.mongodb.net/banorte_hackathon?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function check() {
  try {
    await client.connect();
    console.log('Connected correctly to server');
    
    const db = client.db('banorte_hackathon');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    for (const coll of collections) {
      const collection = db.collection(coll.name);
      const count = await collection.countDocuments();
      console.log(`\nCollection: ${coll.name} - Count: ${count}`);
      if (count > 0) {
        const sample = await collection.findOne({});
        console.log('Sample:', JSON.stringify(sample, null, 2));
      }
    }
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.close();
  }
}

check();

import mongoose from 'mongoose';

const uri = 'mongodb+srv://new_seatManagement:Ethara1230@cluster0.ty7ichr.mongodb.net/ethara_seat_db?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing Atlas connection to:', uri);

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB Atlas Cloud Cluster!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database Name:', mongoose.connection.name);
    console.log('State:', mongoose.connection.readyState);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Atlas Connection Error:', err.message);
    console.error('Error Code:', err.code);
    console.error('Full Error:', err);
    process.exit(1);
  });

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uri = 'mongodb+srv://new_seatManagement:Ethara1230@cluster0.ty7ichr.mongodb.net/ethara_seat_db?retryWrites=true&w=majority&appName=Cluster0';
console.log('Testing Atlas connection to:', uri);
mongoose_1.default
    .connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB Atlas Cloud Cluster!');
    console.log('Host:', mongoose_1.default.connection.host);
    console.log('Database Name:', mongoose_1.default.connection.name);
    console.log('State:', mongoose_1.default.connection.readyState);
    process.exit(0);
})
    .catch((err) => {
    console.error('❌ Atlas Connection Error:', err.message);
    console.error('Error Code:', err.code);
    console.error('Full Error:', err);
    process.exit(1);
});

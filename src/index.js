import { initMongoDb } from "./db/initMongoDb.js";
import { startServer } from "./server.js";




const bootstrap = async () =>{
await initMongoDb();
startServer();
};

bootstrap();
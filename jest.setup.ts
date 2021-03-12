import 'reflect-metadata'
import { Connection, createConnection,getConnection, getConnectionOptions } from "typeorm";
 
beforeEach(async ()=>{
    const connection = await createConnection({
        type: "mongodb",
        database: "typeorm-ac",
        host: 'localhost',
        entities: ["src/entities/*.entity.ts"],
        synchronize:true,
        useNewUrlParser: true,
        logging: "all",
        useUnifiedTopology:true
    }).catch((...args)=>console.log(...args));
})

afterAll(async () => {
    let conn = await getConnection();
    await conn.dropDatabase()
    return await conn.close();
});
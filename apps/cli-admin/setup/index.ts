import { migrateDbApi } from "./migrates/db-api";
import { migrateDbJob } from "./migrates/db-job";
import { insertApiSeed } from "./seeds/db-api";
import { createFirebaseUser } from "./seeds/firebase";

migrateDbApi();
migrateDbJob();
await insertApiSeed();
await createFirebaseUser();

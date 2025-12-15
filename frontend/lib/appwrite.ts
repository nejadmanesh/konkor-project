import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("692f8560001b422ef158");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };

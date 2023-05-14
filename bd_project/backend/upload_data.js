const {MongoClient} = require('mongodb');

async function main(){

    const uri = "mongodb+srv://marcinxkomputer:m4tB3SHDSzMIyhAg@cluster0.b1ip0ti.mongodb.net/";


    const client = new MongoClient(uri);

    try {
        await client.connect();

        // Make the appropriate DB calls

        // Create a single new listing


        // Create 3 new listings
        await createMultipleListings(client, [
            {
                title: "Pan Tadeusz",
                publisher: "Eska",
                category: "Dramat",
                bedrooms: 5,
                bathrooms: 4.5,
                beds: 5
            },
            {
                name: "Private room in London",
                property_type: "Apartment",
                bedrooms: 1,
                bathroom: 1
            },
            {
                name: "Beautiful Beach House",
                summary: "Enjoy relaxed beach living in this house with a private beach",
                bedrooms: 4,
                bathrooms: 2.5,
                beds: 7,
            }
        ]);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

async function createMultipleListings(client, newListings){
    const result = await client.db("library").collection("books").insertMany(newListings);

    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

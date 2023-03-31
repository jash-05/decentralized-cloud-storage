package config

import (
	"context"
	"example/backend/constants"
	"fmt"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectDB() *mongo.Client {
	var mongoUri = constants.MONGO_URI
	var ctx = context.Background()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoUri))
	if err != nil {
		fmt.Println("error connecting to MongoDB: ", err)
		panic(err)
	}

	fmt.Println("Connected to MongoDB!")
	return client
}

var DB *mongo.Client = ConnectDB()

func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	return client.Database(constants.DB_NAME).Collection(collectionName)
}

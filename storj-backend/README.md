### Run the PeerDrive Go-Storj APIs server:

1. Install `go` locally
2. `cd` into the `storj-backend` folder
3. Run `go get .` // downloads all dependancies and creates a `go.sum` file which is ignored
4. Make sure that `nodemon` is installed globally
5. Run the web-app with nodemon so we've a live server on every save using `nodemon --exec go run main.go --signal SIGTERM`

### Learnings

-   What is the difference between `bson.M` and `bson.D` in Go's `mongo-driver` ?
    -   You may use `bson.M` for the filter, it usually results in shorter and clearer filter declaration, the order of fields doesn't matter, the MongoDB server is smart enough to find matching indices regardless of the used order. E.g. if you have a compound index with fields A and B, using a `bson.D` filter listing B first then A will not prevent the server to use the existing index. So in this case you may use `bson.M` and `bson.D`, it doesn't matter.
    -   The order does matter when you specify sort fields for example. It does matter if you sort by field A then by field B, it may be a completely different order than sorting by B first and then by A. So when you specify a sort document having multiple fields, you should definitely use `bson.D`.
    -   The order may also matter (to you) when you insert a new document for example. If you use a `bson.M` as the document, the order of fields is not guaranteed to be the same in all your documents. When you use `bson.D`, then the order in the saved document will match the order as you list the fields in `bson.D`.

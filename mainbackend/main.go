package main

import (
	"example.com/mainbackend/routes/renter"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	router := gin.Default()
	router.Use(cors.Default())
	renter.Routes(router)

	router.Run("localhost:8081")
}

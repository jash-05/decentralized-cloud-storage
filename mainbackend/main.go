package main

import (
	"example.com/mainbackend/routes/renter"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	renter.Routes(router)

	router.Run("localhost:8081")
}

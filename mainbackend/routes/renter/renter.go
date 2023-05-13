package renter

import (
	"net/http"

	"example.com/mainbackend/services/renter"
	"github.com/gin-gonic/gin"
)

type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

// albums slice to seed record album data.
var albums = []album{
	{ID: "4", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

func getAlbums(c *gin.Context) {
	// c.Header("Access-Control-Allow-Origin", "*")
	c.IndentedJSON(http.StatusOK, albums)
}

func Routes(router *gin.Engine) {
	renterRoutes := router.Group("renter")
	{
		renterRoutes.POST("albums", getAlbums)
		renterRoutes.POST("register", renter.Register)
		renterRoutes.POST("login", renter.Login)
		renterRoutes.PUT("updateProfile", renter.UpdateProfile)
		renterRoutes.GET("getProfile", renter.GetProfile)
		renterRoutes.GET("getHighLevelMetrics", renter.GetHighLevelMetrics)
	}
}

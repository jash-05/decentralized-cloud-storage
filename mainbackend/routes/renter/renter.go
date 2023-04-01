package renter

import (
	"example.com/mainbackend/services/renter"
	"github.com/gin-gonic/gin"
)

func Routes(router *gin.Engine) {
	renterRoutes := router.Group("renter")
	{
		renterRoutes.POST("register", renter.Register)
		renterRoutes.POST("login", renter.Login)
		renterRoutes.PUT("updateProfile", renter.UpdateProfile)
		renterRoutes.GET("getProfile", renter.GetProfile)
	}
}

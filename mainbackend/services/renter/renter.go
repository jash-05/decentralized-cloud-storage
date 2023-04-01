package renter

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

// function to register new user
func Register(c *gin.Context) {
	fmt.Println("Register")
}

// function to login user
func Login(c *gin.Context) {
	fmt.Println("Login")
}

// function to update user profile
func UpdateProfile(c *gin.Context) {
	fmt.Println("UpdateProfile")
}

// function to get user profile
func GetProfile(c *gin.Context) {
	fmt.Println("GetProfile")
}

package renter

import (
	"fmt"
	"net/http"

	"example.com/mainbackend/db/config"
	"example.com/mainbackend/db/models"
	"example.com/mainbackend/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// function to register new user
func Register(c *gin.Context) {

	renterCollection := config.GetCollection(config.DB, string(models.RENTERS))
	newRenter := models.NewRenterRequestBody{}

	if err := c.BindJSON(&newRenter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	// check if renter already exists
	renterExists := models.Renter{}
	err := renterCollection.FindOne(c, bson.M{"email": newRenter.Email}).Decode(&renterExists)
	if err != nil {
		if err != mongo.ErrNoDocuments {
			c.JSON(http.StatusConflict, gin.H{"message": "Error while checking if renter exists"})
			return
		}
	} else {
		c.JSON(http.StatusConflict, gin.H{"message": "Renter already exists"})
		return
	}

	passwordHash, err := HashPassword(newRenter.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error while hashing password"})
		return
	}

	renterPayload := models.Renter{
		FirstName: newRenter.FirstName,
		LastName:  newRenter.LastName,
		Username:  utils.GenerateRandomCharsetId(),
		Email:     newRenter.Email,
		Password:  passwordHash,
	}

	_, err = renterCollection.InsertOne(c, renterPayload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"message": "New renter created successfully"})
}

// function to login user
func Login(c *gin.Context) {
	renterCollection := config.GetCollection(config.DB, string(models.RENTERS))
	loginRenter := models.LoginRenterRequestBody{}

	if err := c.BindJSON(&loginRenter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	renterDocument := models.Renter{}
	err := renterCollection.FindOne(c, bson.M{"email": loginRenter.Email}).Decode(&renterDocument)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "No user exists with the given email"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(renterDocument.Password), []byte(loginRenter.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Incorrect password"})
		return
	}

	c.IndentedJSON(http.StatusFound, gin.H{"renterId": renterDocument.ID})
}

// function to update user profile
func UpdateProfile(c *gin.Context) {
	fmt.Println("UpdateProfile")
}

// function to get user profile
func GetProfile(c *gin.Context) {
	fmt.Println("GetProfile")
}

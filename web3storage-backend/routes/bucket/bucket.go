package bucketroutes

import (
	"example/web3/services/bucket"

	"github.com/gin-gonic/gin"
)

func Routes(web3Routes *gin.RouterGroup) {
	bucketRoutes := web3Routes.Group("bucket")
	{
		bucketRoutes.POST("create", bucket.CreateBucket)
		bucketRoutes.GET("getFiles", bucket.GetFilesForBucket)
		bucketRoutes.GET("getBucketsForRenter", bucket.GetBucketsForRenter)
		// bucketRoutes.POST("empty", bucket.EmptyBucket)
		// bucketRoutes.DELETE("delete", bucket.DeleteBucket)
	}
}

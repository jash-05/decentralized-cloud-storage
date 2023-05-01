package fileroutes

import (
	"example/web3/services/file"

	"github.com/gin-gonic/gin"
)

func Routes(web3Routes *gin.RouterGroup) {
	fileRoutes := web3Routes.Group("file")
	{
		fileRoutes.POST("upload", file.UploadFiletoNetwork)
		// fileRoutes.GET("download", downloadFile)
		fileRoutes.DELETE("delete", file.DeleteFile)
		// fileRoutes.GET("viewFileMetadata", viewFileMetadata)
		// fileRoutes.GET("getHighLevelMetrics", getHighLevelMetrics)
	}
}

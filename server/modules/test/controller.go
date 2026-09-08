package test

import (
	"github.com/Gary-Yez/go-admin/request"
	"github.com/Gary-Yez/go-admin/response"
	"github.com/gin-gonic/gin"
)

type controllerStruct struct{}

func (c *controllerStruct) Test(ctx *gin.Context) {
	_, err := request.GetReq(ctx)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, Service.Test())
}

package test

import (
	"gitee.com/mxcker/go-admin/request"
	"gitee.com/mxcker/go-admin/response"
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

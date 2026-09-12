package main

import (
	"fmt"
	"github.com/Gary-Yez/go-admin"
	_ "github.com/Gary-Yez/go-admin-template/modules"
	_ "github.com/Gary-Yez/go-admin-template/settings"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"os"
)

func main() {
	// 在框架注册路由前配置全局中间件。
	if err := admin.ConfigureEngine(func(engine *gin.Engine) error {
		config := cors.DefaultConfig()
		config.AllowAllOrigins = true // 可按部署环境改为指定 AllowOrigins。
		config.AllowHeaders = append(config.AllowHeaders, "Authorization")
		engine.Use(cors.New(config))
		return nil
	}); err != nil {
		fatal("注册服务配置失败", err)
	}
	// 启动服务
	if err := admin.Run(); err != nil {
		fatal("启动管理端失败", err)
	}
}

func fatal(message string, err error) {
	_, _ = fmt.Fprintf(os.Stderr, "%s：%v\n", message, err)
	os.Exit(1)
}

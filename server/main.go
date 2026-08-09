package main

import (
	"fmt"
	"gitee.com/mxcker/go-admin-template/server/modules"
	"os"
)

func main() {
	modules.Init()
	if err := admin.Run(true); err != nil {
		fatal("启动管理端失败", err)
	}
}

func fatal(message string, err error) {
	_, _ = fmt.Fprintf(os.Stderr, "%s：%v\n", message, err)
	os.Exit(1)
}

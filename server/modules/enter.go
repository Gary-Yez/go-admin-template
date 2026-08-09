package modules

import (
	"gitee.com/mxcker/go-admin"
	"gitee.com/mxcker/go-admin-template/server/modules/test"
)

func Init() {
	admin.MustRegister("test", new(test.Mounter))
}

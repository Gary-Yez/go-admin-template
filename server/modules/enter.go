package modules

import (
	"github.com/Gary-Yez/go-admin"
	"github.com/Gary-Yez/go-admin-template/modules/test"
)

func Init() {
	admin.MustRegister("test", new(test.Mounter))
}

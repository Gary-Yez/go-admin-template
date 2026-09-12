package settings

// Init 用于填充用户配置的动态初始值，由框架在启动时自动调用。
// 本文件由开发者维护，配置生成器不会覆盖。
//
// 执行顺序：标签 default → 框架内置初始化 → 本方法 → 补建缺失配置。
// 每次启动都会执行，但只为数据库中不存在的 Key 保存初始值，已有值不会覆盖。
// 框架内置配置的初始化由框架处理，不需要在这里手动调用。
func (c *config) Init() error {
	// 固定默认值直接在开发工具的配置定义中填写，无需在这里重复设置。
	// 动态初始值可根据环境变量、计算结果等确定。
	//
	// 示例：先通过开发工具添加 Key 为 order.timeout 的 int 配置，
	// 生成 OrderTimeout 字段后，在本文件导入 admin 包即可使用：
	//
	// import admin "github.com/Gary-Yez/go-admin"
	//
	// c.OrderTimeout = admin.ConfigDefault(60)
	//
	// 返回错误会中止启动。这里设置初始值，不要用 Get/MustGet 读取配置，
	// 此时配置尚未完成初始化；正常业务读取使用 settings.OrderTimeout.Get()。
	return nil
}

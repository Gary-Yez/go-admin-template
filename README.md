# go-admin-template

基于 [go-admin](https://github.com/Gary-Yez/go-admin) 后端框架和 [go-admin-web](https://github.com/Gary-Yez/go-admin-web) 公共前端的业务开发模板。它负责应用启动、业务模块、业务配置和业务页面，系统功能由依赖提供。

使用 Codex 开发前请阅读 [AGENTS.md](./AGENTS.md)：这是随模板提供给业务项目使用者的开发指引，要求先获取前后端最新线上 README，再核对安装版本、复用公开能力，并在每次需求交付前清理冗余代码、检查可读性和验证结果。以本项目根目录打开 Codex 并开始新任务，使项目指引被加载。

适合从后台管理能力直接开始开发业务：

- 内置多角色、菜单和接口权限，支持角色默认首页。
- 提供管理员、API 密钥、登录日志、配置管理、计划任务和节点监控。
- 开发工具生成 Go 模块、Vue 页面及配置定义，支持预览变更与生成历史。
- 系统页面与业务页面共享请求、布局、主题、筛选、表格和表单组件。
- 支持 MySQL / PostgreSQL；单实例可使用内存缓存，多实例使用共享 Redis。
- 前端编译后交由 Go 服务托管，可作为一个应用部署。

## 项目结构与架构

```text
go-admin-template/
├── server/
│   ├── main.go              # 配置全局 Gin 中间件，启动框架
│   ├── go.mod / go.sum      # 业务模块名与后端依赖
│   ├── config.yaml         # 运行环境：端口、数据库、Redis、JWT 密钥
│   ├── modules/
│   │   └── enter.go        # 注册业务模块
│   ├── settings/
│   │   ├── config.go       # 配置结构及公开配置项，开发工具维护
│   │   └── init.go         # 开发者维护动态初始值
│   └── dist/               # 前端构建产物，构建时生成
├── web/
│   ├── src/
│   │   ├── main.ts         # 创建管理端应用
│   │   ├── pages.ts        # 收集业务页面
│   │   ├── style.css       # 宿主样式入口
│   │   ├── views/          # 业务页面，开发时按需创建
│   │   └── apis/           # 业务请求，开发时按需创建
│   ├── public/             # Logo 等静态资源
│   ├── .env                # 前端构建环境
│   ├── vite.config.ts      # 源码编译、依赖去重、输出目录
│   ├── tailwind.config.js  # 扫描业务页面和公共前端样式
│   └── package.json / yarn.lock
└── Dockerfile
```

三个部分的职责：

| 部分 | 维护内容 | 扩展方式 |
| --- | --- | --- |
| go-admin | 系统模块、鉴权、数据库与缓存、任务及配置基础能力 | Go 依赖，注册业务 Module |
| go-admin-web | 系统页面、路由、状态、布局、请求和公共组件 | npm 依赖，注册业务页面 |
| 本模板 | 应用入口、业务数据、业务接口、业务页面与配置 | 直接编写或生成源码 |

请求经过“前端 request → 后端身份与接口权限 → 模块控制器 → 业务服务 → 数据库/缓存”。业务数据归属和租户范围由业务服务限制，菜单隐藏不代表接口被禁止。

## 快速上手

### 1. 下载并准备依赖

准备 Go 1.25.5 或更新的兼容版本、Node.js 24、Yarn 1.22.22，以及 MySQL 或 PostgreSQL。先创建空数据库，框架启动时初始化表。

```sh
git clone https://github.com/Gary-Yez/go-admin-template.git my-admin
cd my-admin
```

也可在 GitHub 使用模板创建自己的仓库。独立业务项目不需要下载后端框架和公共前端的源码仓库。

模板已使用发布的 Go/npm 依赖，无需同级源码目录。安装依赖：

```sh
cd server
go mod download
cd ../web
yarn install
```

后端与公共前端按配套版本更新。安装后提交依赖和锁文件；依赖锁完整时，日常安装可使用 `yarn install --frozen-lockfile`。

### 2. 设置后端并启动

在 `server/` 目录运行：

```sh
go run .
```

模板的 config.yaml 使用通用默认值，jwt.secret 留空。先填写数据库连接，并生成自己的随机密钥填入 jwt.secret：

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

密钥填写后再启动服务；多实例填写同一个密钥。如果 config.yaml 不存在，首次启动会自动生成随机密钥和默认配置，然后退出，填写数据库连接后重新启动即可。

主要设置：

```yaml
server:
  dev: true
  host: "0.0.0.0"
  port: "8080"
  admin_prefix: "/admin"
  api_prefix: "/api"
database:
  driver: "mysql"
  host: "127.0.0.1"
  port: "3306"
  username: "your_user"
  password: "your_password"
  name: "your_database"
  sslmode: "disable"
redis:
  host: ""
  port: "6379"
  db: 0
```

这是字段说明片段，**不要用它覆盖完整配置并删掉 jwt.secret**。PostgreSQL 改为 driver: postgres、对应端口和连接参数。开发使用 dev: true，正式部署关闭。Redis host 留空适用于单实例，多实例使用同一 Redis。

指定其他配置文件时执行 `go run . --config config.local.yaml`。配置文件路径不改变进程工作目录；开发工具依赖模板布局，应从 server 目录启动。

### 3. 启动前端

web/.env 的生产 API 地址为 `/api`，web/.env.development 已配置开发地址 `http://localhost:8080/api`，可直接启动 Vite。需要改开发地址时，在不提交到仓库的 `web/.env.development.local` 中覆盖：

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

```sh
cd web
yarn dev
```

从 Vite 输出的地址访问，避免直接在尚未构建 dist 时访问后端 /admin。远程开发时，把 localhost 换成浏览器能访问的后端地址。修改 .env 后重启前端开发服务。

main.go 已注册 CORS 中间件，开发阶段允许跨域；正式环境按部署域名调整。前端 dev 仅决定开发工具入口展示，真正的接口开放由后端 server.dev 控制。

首次空数据库初始化账号为 `admin`，密码为 `123456`。首次登录后修改密码。

### 4. 更换业务 Go 模块名

准备正式业务仓库时：

```sh
cd server
go mod edit -module example.com/my-admin
```

随后将 server 下源码中的 `github.com/Gary-Yez/go-admin-template/` 导入前缀替换为 `example.com/my-admin/`，包括 main.go 的 modules、settings 导入，以及已生成模块之间的导入，再执行 `go mod tidy`。

不要替换框架依赖 `github.com/Gary-Yez/go-admin`。建议生成业务模块前先改好模块名。

## 实例：开发商品管理

### 通过生成器创建完整 CRUD

1. 确认后端 server.dev 为 true，从 server 目录启动，并使用 Vite 开发前端。
2. 打开“开发工具 → 代码生成”，创建商品管理模块，填写模块标识与中文名称。
3. 保留内置 ID、创建时间、更新时间；添加名称、价格、状态等业务字段。
4. 按字段选择表格展示、表单、筛选与排序能力；内置三个字段默认支持排序。
5. 按业务勾选新增、修改、删除。未启用的能力不会只隐藏按钮，而是影响生成代码。
6. 选择菜单父级和菜单图标，检查预览；有覆盖变更时确认后应用。
7. 检查生成文件并重启 Go 服务，使新模块注册和数据库初始化生效。
8. 在角色管理中分配新菜单、接口权限，再以目标角色检查访问。

生成后通常按以下职责继续开发：

| 文件 | 应写内容 |
| --- | --- |
| 模块 enter.go | 模块名称、路由、建表及初始化、菜单定义 |
| 模块 model.go | 持久化模型、字段约束、必要的请求结构 |
| 模块 controller.go | 参数绑定、身份读取、调用服务、返回响应 |
| 模块 service.go | 业务规则、查询、事务、缓存维护 |
| modules/enter.go | 把模块接入启动过程 |
| web/src/apis/模块.ts | 调用统一 request |
| web/src/views/模块/index.vue | 列表、筛选、编辑表单与交互 |

先提交现有改动，再确认生成覆盖。生成历史支持删除关联的本地文件，操作前核对清单；它不是 Git 回滚，也不代表数据库业务表同步删除。生成器修改的是业务源码，修改 Go 后需要重新启动。

### 手动添加一个接口

不使用生成器也能注册模块。创建 `server/modules/product/enter.go`：

```go
package product

import (
    admin "github.com/Gary-Yez/go-admin"
    "github.com/Gary-Yez/go-admin/response"
    "github.com/gin-gonic/gin"
)

type Mounter struct{}

func (*Mounter) Name() string { return "商品管理" }
func (*Mounter) Initialize() error { return nil }

func (*Mounter) AdminRouter(group *gin.RouterGroup) {
    group.GET("ping", func(ctx *gin.Context) {
        response.Success(ctx, gin.H{"message": "商品模块已就绪"})
    })
}

func (*Mounter) PublicRouter(group *gin.RouterGroup) {}

func (*Mounter) Menus() []admin.MenuDefinition {
    return []admin.MenuDefinition{{
        Key: "product", Name: "商品管理", Path: "product",
        Icon: "iconoir:box", Component: "../views/product/index.vue", Sort: 10,
    }}
}
```

在 `server/modules/enter.go` 注册；下面按未改名的模板模块路径举例：

```go
package modules

import (
    admin "github.com/Gary-Yez/go-admin"
    "github.com/Gary-Yez/go-admin-template/modules/product"
)

func init() {
    admin.MustRegister("product", &product.Mounter{})
}
```

main 已空白导入 modules，无需再手动调用 Initialize。新增数据表时，将 AutoMigrate 放在模块 Initialize 内；接口路径为 `/api/product/ping`，参与权限管理。需要匿名接口时才放 PublicRouter，它不会自动经过登录和 Casbin 校验。

### 接上业务页面

创建 `web/src/views/product/index.vue`：

```vue
<script setup lang="ts">
import {ref} from 'vue'
import {PageHeader, request} from '@gary-yez/go-admin-web'

const message = ref('点击按钮检查业务接口')
const loading = ref(false)

async function check() {
  loading.value = true
  try {
    const result = await request.get('/product/ping')
    message.value = result.data.message
  } catch (error) {
    message.value = typeof error === 'string'
      ? error
      : error instanceof Error ? error.message : '请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-card class="container" shadow="never">
    <PageHeader title="商品管理" description="管理商品资料与业务数据" />
    <p>{{ message }}</p>
    <el-button type="primary" :loading="loading" @click="check">检查接口</el-button>
  </el-card>
</template>
```

pages.ts 自动收集 views 下的 Vue 页面，菜单中的组件值填写 `../views/product/index.vue`。重启后端后，使用超级管理员或已分配权限的角色进入菜单。

此示例展示模块、权限菜单和页面请求如何连接；完整列表与增删改使用生成器生成。不要同时手动注册和生成同一个模块 Key。

## 配置定义与业务调用

config.yaml 只承担环境信息。业务配置使用“开发工具 → 配置定义”声明名称、Key、分组、类型、默认值和说明；生成到 settings/config.go，部署后由框架补齐数据库配置记录。

例如定义 `order.timeout`，生成 `OrderTimeout` 后：

```go
minutes, err := settings.OrderTimeout.Get()
if err != nil {
    return err
}
_ = minutes // int，业务中使用它计算订单过期时间
```

框架内置站点名称读取：`settings.BaseConfig.SiteName.Get()`。业务字段直接通过 settings 字段访问，不需要中间的 Config 层。

动态初始值放在 `settings/init.go`，并添加 admin 导入：

```go
func (c *config) Init() error {
    c.OrderTimeout = admin.ConfigDefault(60)
    return nil
}
```

Init 在框架初始化配置时调用，每次启动执行，但只对数据库中缺失的 Key 保存初始值。不要在此读取 Get/MustGet，也不要调用 BaseConfig.Init。已有值通过“配置管理”修改；改默认值不会覆盖生产数据库。

Get 按 Key 读取缓存，未命中从数据库加载；MustGet 错误时 panic，业务请求优先处理 Get 的错误。配置管理支持手动同步缓存和清理无效配置；“无效”按当前实例结构判断，多版本共存时先确认其他实例是否仍使用对应 Key。

## 页面与后端开发约定

- 前端公共能力从 `@gary-yez/go-admin-web` 导入：PageHeader、ColumnTable、FormDialog、FormNote、TableTime、IconSelect、request、confirmDelete 和各 Store。
- PageHeader 图标优先来自当前菜单，无图标时用 Grid；无需把菜单图标写死在页面。
- 表格使用 ColumnTable 和页面唯一 storageKey；刷新、新增、批量删除放 toolbar，批量删除只在有选择时显示。
- 输入框、选择器、表格使用 large。文字和数字筛选失焦查询，选择框变化查询，时间使用范围筛选。
- 筛选复用公共 search-form 样式；列表包含 el-empty 和 listError，错误 alert 的间距放在外层 div。
- 删除复用 confirmDelete，侧面编辑复用 FormDialog；它默认支持 Esc 关闭。
- 后端参数复用 request.GetReqList/GetReq/GetReqIds，筛选和排序白名单放服务端。
- response.Error 的错误码在 JSON code 中，HTTP 状态仍为 200；前端统一 request 已处理该协议。
- 模块初始化才可访问 admin.DB/Cache/Scheduler；不要在包 init 中操作数据库。
- 任务处理函数在模块 Initialize 中注册，再在计划任务页面配置实例。默认北京时间，`0 3 * * *` 表示每天 03:00。

接口签名、组件参数、缓存和锁语义请查阅 [后端公开 API 文档](https://github.com/Gary-Yez/go-admin#readme) 与 [前端公开 API 文档](https://github.com/Gary-Yez/go-admin-web#readme)。

## 构建与部署

前端生产 API 地址可使用默认 `/api`，浏览器与后端同源：

```sh
cd web
yarn build
cd ../server
go build -o go-admin .
```

yarn build 会先执行 Vue/TypeScript 检查，再输出到 server/dist。部署以下内容到同一运行目录：

```text
app/
├── go-admin        # Windows 为相应的 exe 文件
├── config.yaml
└── dist/
```

从该目录执行 `./go-admin --config config.yaml`，Windows 可使用 `.\go-admin.exe --config config.yaml`。默认访问 `http://服务器:8080/admin/`。配置中的数据库和 Redis 地址应是部署环境能访问的地址。

前端环境变量在构建时写入产物，修改运行时 YAML 不会改变前端 API URL；更改前端地址需要重新构建。

### Docker 部署

Dockerfile 按前端构建 → Go 构建 → 最小运行镜像三个阶段执行，从 npm 和 Go 模块仓库获取已发布依赖。只需要当前项目目录，不依赖本地维护环境或额外构建上下文。运行目录为 /app，包含 dist 和 config.yaml。

从项目根目录执行：

```sh
docker build -t my-admin:local .
docker run -d --name my-admin -p 8080:8080 my-admin:local
```

镜像默认复制 server/config.yaml，构建前填写部署配置及随机 JWT 密钥；需要运行时替换时，将自己的配置文件挂载到 /app/config.yaml，并确保容器用户有读取权限。EXPOSE 只是声明，发布端口仍需要 -p；若配置改了容器监听端口，映射也需相应修改。

## 升级与日常开发

后端通过 go get 更新框架，前端通过 yarn add 更新公共包，然后重新构建应用。业务模块、已生成页面和 settings/init.go 由本项目维护，不会随依赖升级自动覆盖。

多实例保持数据库、Redis 和 JWT 密钥一致；同一数据库在各实例配置中的连接标识也应一致，避免缓存命名空间分离。任务业务自行保证幂等。

正式部署前关闭 server.dev，修改初始密码，检查数据库连接、CORS 和 API 地址。不要把实际生产密码或签名密钥提交到公共仓库。

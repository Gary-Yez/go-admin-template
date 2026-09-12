# go-admin-template

基于 **go-admin** 的前后端业务开发模板，帮助开发者快速搭建管理后台。

- **开箱可用的系统页面**：管理员、角色、菜单、API、配置管理和定时任务。
- **可视化代码生成**：生成业务模块、前端页面与 API，支持字段筛选、菜单和按需增删改。
- **简洁的配置调用**：`settings.BaseConfig.SiteName.Get()`，用户配置直接通过字段访问。
- **统一开发体验**：复用请求封装、表格、图标选择、表单和删除提示。

框架公开方法说明见 [go-admin README](https://github.com/Gary-Yez/go-admin#readme)。

## 项目结构

```text
go-admin-template/
├── server/
│   ├── main.go             # 后端启动入口
│   ├── go.mod              # 后端依赖
│   ├── config.yaml         # 数据库、Redis、端口等环境配置
│   ├── dist/               # 前端构建结果
│   ├── modules/            # 用户业务模块
│   └── settings/           # 用户配置定义与初始化
└── web/
    ├── package.json        # 安装公共包与业务依赖
    ├── vite.config.ts      # 公共包和业务页面统一构建
    ├── .env                # API 地址
    ├── public/             # 项目 Logo、默认头像等资源
    └── src/
        ├── main.ts         # createAdminApp 启动入口
        ├── pages.ts        # 收集并注册业务页面
        ├── style.css       # Tailwind 与用户样式入口
        ├── apis/           # 业务 API
        └── views/          # 业务页面
```

开发业务主要修改 `server/modules`、`server/settings/init.go`、`web/src/apis` 和 `web/src/views`。系统后端功能由 go-admin 提供。

公共前端的接入、公开接口、维护和发布说明见 [go-admin-web 文档](../go-admin-web/README.md)。当前使用 `file:../../go-admin-web` 同级源码依赖，需按同级目录布局放置公共包，发布到 npm 后可按版本升级。本地维护在总目录执行 `./maintain.ps1 init`，再分别执行 `./maintain.ps1 server` 和 `./maintain.ps1 web`。代码生成需同步使用包含公共包导入更新的 go-admin 版本。

## 快速启动

### 1. 准备环境

- Go 1.25.5。
- MySQL 或 PostgreSQL，提前创建数据库和账号。
- Node.js 22.12+，安装 Yarn；项目已有 yarn.lock。
- Redis 可选：单实例可使用内存缓存，多实例使用共享 Redis。

### 2. 启动后端

在项目的 server 目录执行：

```sh
cd server
go mod download
go run .
```

修改 `server/config.yaml` 中的数据库信息。文件不存在时，首次运行会生成默认文件并退出，填写后再次运行即可。

开发配置示例：

```yaml
server:
  dev: true
  host: "0.0.0.0"
  port: "8080"
  admin_prefix: "/admin"
  api_prefix: "/api"
database:
  driver: "mysql" # mysql / postgres
  host: "127.0.0.1"
  port: "3306"
  username: "your_user"
  password: "your_password"
  name: "your_database"
  sslmode: "disable" # PostgreSQL TLS 模式；MySQL 忽略
redis:
  host: "" # 留空使用内存缓存
  port: "6379"
  username: ""
  password: ""
  db: 0
```

使用 PostgreSQL 时，将 `database.driver` 改为 `postgres`，端口改为 `5432`（或实际端口）。旧配置的 `mysql` 节点需要改为 `database`，其中的 `database` 字段改为 `name`；切换连接不会自动迁移已有数据库数据。

也可指定配置文件：

```sh
go run . -c config.dev.yaml
```

后端保持从 server 目录运行，开发工具会按此目录定位业务代码和相邻的 web。生产环境将 dev 设为 false；dev=true 的开发工具接口无需登录，仅用于受控开发环境。

### 3. 启动前端

另开终端，在项目的 web 目录执行：

```sh
cd web
yarn install
yarn dev
```

打开终端输出的前端地址。开发 API 地址在 `.env.development`：

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

修改后端端口或 API 前缀时同步修改此地址，并重启前端开发服务。

### 4. 登录后台

首次初始化的账号为 `admin`，密码为 `123456`。登录后修改密码。

## Docker 部署

先准备好 `server/config.yaml`，再在项目根目录构建镜像。Docker 会完成前端和后端编译，无需在宿主机安装 Go 或 Node.js：

```sh
docker build --build-context go-admin-web=../go-admin-web -t go-admin-template:latest .
```

镜像包含 Go 程序和前端静态文件，由后端直接提供页面，不需要额外部署 Nginx。`server/config.yaml` 会复制到镜像运行根目录 `/app/config.yaml`，MySQL/PostgreSQL 和 Redis 使用外部服务。

构建前请填写 `server/config.yaml` 的数据库及可选 Redis 连接信息。没有配置时，可先在 `server` 目录运行 `go run .`，由框架生成配置和随机 JWT 签名密钥；生成后退出是正常行为。容器中的 `127.0.0.1` 指向容器自身，连接外部服务需使用可访问的主机地址或同一 Docker 网络中的服务名。

### 启动服务

直接使用镜像内配置启动：

```sh
docker run -d --name go-admin --restart unless-stopped -p 8080:8080 go-admin-template:latest
```

如需覆盖镜像内配置，在外部 `config.yaml` 所在目录运行（支持 PowerShell 和常见 Linux shell）：

```sh
docker run -d --name go-admin --restart unless-stopped -p 8080:8080 --mount "type=bind,source=$(pwd)/config.yaml,target=/app/config.yaml,readonly" go-admin-template:latest
```

访问 `http://localhost:8080/admin/`。查看日志：

```sh
docker logs -f go-admin
```

容器以 UID 10001 的普通用户运行，挂载配置须对该用户可读。运行目录为 `/app`，默认配置路径为 `/app/config.yaml`。镜像不设置运行时环境变量覆盖配置，开发模式、监听地址和端口由 `/app/config.yaml` 决定。生产配置请设置 `server.dev: false`、`server.host: "0.0.0.0"`。以上命令以 `server.port: "8080"`、`server.admin_prefix: "/admin"` 为例；`-p` 右侧端口须与配置中的监听端口一致，左侧为宿主机端口。Dockerfile 中的 `EXPOSE 8080` 只是端口声明，不会覆盖配置。

多实例使用同一数据库、共享 Redis 和相同的 JWT 签名密钥，复用同一份配置。使用镜像内配置时，修改项目配置后需要重新构建镜像并重建容器；使用外部挂载配置时，修改后重启容器生效。

前端 API 地址使用 `web/.env` 中的 `VITE_API_BASE_URL`；如果存在 `web/.env.production`，生产构建会优先使用其中的同名设置。修改后端 `server.api_prefix` 时，同步修改前端环境配置并重新构建镜像。本地专用的 `.env.local` 和 `.env.*.local` 已在 `.dockerignore` 中排除，不参与镜像构建。

## 生成并开发一个模块

### 使用代码生成器

1. 前端使用 `yarn dev`，后端配置 dev=true。
2. 打开代码生成页面，填写模块名、模型名和展示名称。
3. 设置字段类型、列表显示、编辑、必填和筛选能力。
4. 按需开启新增、编辑、删除，选择是否添加菜单及菜单图标。
5. 预览生成结果，存在冲突时逐项确认覆盖。
6. 生成后检查业务逻辑，编译并重启后端。
7. 为普通角色授权新菜单和 API。

生成文件位于：

```text
server/modules/<模块>/model.go
server/modules/<模块>/service.go
server/modules/<模块>/controller.go
server/modules/<模块>/enter.go
web/src/apis/<模块>.ts
web/src/views/<模块>/index.vue
```

生成器同时维护 `server/modules/enter.go` 中的导入与注册。重新生成前查看差异，避免覆盖已经写好的业务逻辑。生成历史支持回填配置，以及删除记录时选择同时删除生成文件。

### 各文件写什么

| 文件 | 职责 |
| --- | --- |
| `model.go` | 数据模型和输入结构 |
| `service.go` | 查询与业务逻辑 |
| `controller.go` | 请求参数、调用服务、返回响应 |
| `enter.go` | 表迁移、路由、菜单和模块信息 |

模块通过包 init 自动注册，不需要在 main 调用注册函数。数据库操作和任务注册写在模块 `Initialize()` 中，由框架在依赖就绪后执行。

生成后端不会自动重启，新增或删除 Go 代码后需要手动重启。

### 常用公开方法

业务文件导入框架：

```go
import (
    admin "github.com/Gary-Yez/go-admin"
    "github.com/Gary-Yez/go-admin/request"
    "github.com/Gary-Yez/go-admin/response"
)
```

| 调用 | 用途 |
| --- | --- |
| `admin.DB()` | GORM 查询、更新、事务和迁移 |
| `admin.Cache()` | 缓存读写及锁 |
| `admin.Scheduler().RegisterHandler(...)` | 注册定时任务处理函数 |
| `request.GetAuthUser(ctx)` | 获取当前用户 ID 和角色 ID |
| `request.GetReqList(ctx)` | 获取分页、筛选和排序参数 |
| `request.GetReqIds(ctx)` | 获取去重后的批量 ID |
| `response.Success(ctx, data)` | 返回成功结果 |
| `response.List(ctx, list, total)` | 返回列表与总数 |
| `response.Error(ctx, err)` | 返回错误 |

缓存业务键按 `模块:具体键` 命名，例如 `order:last_id`。`admin.Cache()` 自动添加 `go-admin:<数据库哈希>:cache:` 前缀，`Lock()` 使用同一命名空间下的 `lock:` 前缀。数据库哈希根据地址、端口和库名计算，多实例应保持这些配置一致；直接使用 `Client()` 不会自动添加前缀。

例如在控制器中获取当前身份：

```go
authUser, err := request.GetAuthUser(ctx)
if err != nil {
    response.Error(ctx, err, 401)
    return
}
// 使用 authUser.UserId 和 authUser.RoleId。
```

列表筛选和排序复用 request 的白名单方法。所有查询检查 GORM Error；统一响应成功时 JSON code 为 200。更多完整调用示例见框架 README。

## 配置项的定义与使用

### 定义配置

数据库和端口等环境信息放 config.yaml；业务参数在开发工具的配置定义中添加，填写名称、Key、分组、类型、默认值、说明。

例如添加 Key `order.timeout`、类型 int、默认值 30，生成器会在 `settings/config.go` 中创建 `OrderTimeout` 配置项。定义改变后编译并重启后端。

`settings/config.go` 由生成器维护，用户代码放在独立文件中。配置实际值在配置管理页面按分组维护，保存到数据库和缓存。

配置定义工具栏的排序按钮支持拖拽业务分组和组内配置项。预览确认后，顺序保存到生成代码和数据库；部署到新数据库也会恢复该顺序。包含内置配置的分组固定，内置项按 BaseConfig 的声明顺序显示，业务项排在其后。

### 读取配置

```go
import "github.com/Gary-Yez/go-admin-template/settings"
```

```go
// 内置配置保留 BaseConfig 分组。
name, err := settings.BaseConfig.SiteName.Get() // string, error
minutes := settings.BaseConfig.JwtExpireMinutes.MustGet() // int

// 模板当前的示例业务字段。
text, err := settings.Test.Get() // string, error

// 添加 order.timeout 后可使用。
timeout := settings.OrderTimeout.MustGet() // int
```

自己的项目修改 module 路径后，同步调整 import。

- `Get()` 返回具体类型的值和错误。
- `MustGet()` 返回具体类型的值，失败时 panic。
- 每次只读取这一项，缓存未命中时再查询数据库。
- 配置自动注册，不需要在 main 手动注册。

### 填充动态初始值

`settings/init.go` 已预留空 Init 方法，不使用时保留即可。添加 OrderTimeout 字段后，可以改为：

```go
package settings

import admin "github.com/Gary-Yez/go-admin"

func (c *config) Init() error {
    c.OrderTimeout = admin.ConfigDefault(60)
    return nil
}
```

固定默认值直接在配置定义中填写；需要计算的值放进 Init。框架自动先处理内置初始化，用户只填写业务部分。

Init 每次启动都会执行，但只补建缺失配置，不覆盖数据库已有值。这里不要用 Get/MustGet 读取配置。`ConfigDefault` 不是运行期修改方法，实际值通过配置管理页面保存。

JWT 签名密钥在启动配置 `jwt.secret` 中，首次生成配置文件时自动随机填写，至少 32 字节；也可通过 `MYAPP_JWT_SECRET` 环境变量覆盖。多实例必须使用相同密钥，修改后重启生效并使旧 JWT 失效。不要提交真实密钥到仓库。登录有效期仍在配置管理中，默认 7 天。

## 菜单、权限与任务

- **菜单**：生成时勾选添加菜单，重启后自动补齐；普通角色需要授权菜单及 API。
- **API**：后台路由在启动时自动登记，在 API 管理编辑说明、分组和清理失效接口。
- **多角色**：管理员可以绑定多个角色，右上角切换当前角色，按当前角色权限访问。
- **API 密钥**：右上角进入密钥页面，按用户拥有的角色创建，可填写备注、有效期或选择永久。
- **定时任务**：先在模块 Initialize 中注册处理函数，再在后台配置任务。Cron 为五段表达式，例如 `*/5 * * * *`，默认 UTC，可指定 `CRON_TZ=Asia/Shanghai`。

## 前端业务开发

业务接口放在 `src/apis`，通过 `import {request} from "@gary-yez/go-admin-web"` 调用。它统一携带令牌并检查响应中的业务 code。业务页面放在 `src/views`。

从 `@gary-yez/go-admin-web` 导入并复用公共组件：

| 组件 | 用途 |
| --- | --- |
| `PageHeader` | 页面标题和菜单图标 |
| `ColumnTable` | 统一表格及列显示能力 |
| `FormDialog` | 表单弹窗 |
| `IconSelect` | 菜单图标选择 |
| `DeleteNotice` | 删除确认内容 |
| `TableTime` | 时间展示 |

新页面以生成器输出和系统页面为例，复用已有筛选、空数据、错误提示和按钮样式。输入框、选择器和表格使用 large；文本与数字筛选失焦查询，选择框变化时查询。

## 构建与运行

在 web 目录构建前端：

```sh
yarn build
```

结果输出至 `server/dist`。默认生产 API 地址为 `/api`，在 `web/.env` 配置。

在 server 目录检查并构建后端：

```sh
go test ./...
go build -o go-admin-server .
```

Windows 使用 `go build -o go-admin-server.exe .`。部署时一起放置可执行文件、config.yaml 和 dist，生产 dev=false，并从该目录运行服务。

默认后台访问地址为 `http://服务器:8080/admin/`。
## 全局服务配置与 CORS

`server/main.go` 在 `admin.Run()` 前调用 `admin.ConfigureEngine()` 配置 CORS。框架不再内置 CORS 中间件，允许来源、请求头等策略由项目控制。当前模板沿用允许所有来源并允许 Authorization 请求头的设置；限制来源时，将 `AllowAllOrigins` 改为 false 并设置 `AllowOrigins`。

也可以在同一回调中配置可信代理或添加其他全局中间件。回调按注册顺序执行，返回错误会停止启动；回调直接注册的路由不自动鉴权、不参与 API 同步。业务路由继续在模块中注册。

## 节点监控

启动新版后在“系统运维 → 节点监控”查看节点；普通角色需分配该菜单及 `/sys_monitor/list` 接口权限。首次采集可能需要几秒。列表可搜索主机/节点名称，支持状态筛选、列显示、详情和短期 CPU 趋势。自动刷新每 5 秒执行，页面隐藏或离开后暂停；请求失败暂停刷新，手动重试。

可在启动 YAML 的 `server` 下添加 `node_name: "admin-01"`，或设置 `MYAPP_SERVER_NODE_NAME`。每个进程生成独立实例 ID，重启不会覆盖旧进程记录。多实例共用 Redis 和数据库命名空间，超过 20 秒无上报标记离线，10 分钟后移除。

机器资源按操作系统可见范围展示，容器场景不代表容器配额；磁盘为运行目录所在卷。进程 CPU 单核满载为 100%，可能超过 100%。本功能只提供实时快照及当前页面短趋势，不保存历史、不开放 pprof。

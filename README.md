# 🎥 Sora Video Generation Platform

基于Sora API的视频生成平台，支持实时进度跟踪和多任务并发处理。

## ✨ 特性

- ✅ **实时进度跟踪** - 轮询机制显示视频生成进度
- ✅ **多任务并发** - 支持同时生成多个视频
- ✅ **自动重试** - 500/503错误自动重试最多5次
- ✅ **后台处理** - 异步处理，不阻塞请求
- ✅ **故障恢复** - 自动清理stuck jobs
- ✅ **完整日志** - 详细的请求和处理日志
- ✅ **Docker支持** - 一键容器化部署
- ✅ **PM2支持** - 生产环境进程管理

## 🚀 快速开始

### 方式一: Docker (推荐)

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env  # 修改SORA_API_URL、SORA_API_TOKEN等

# 2. 一键启动
./docker-start.sh

# 或使用Makefile
make docker-up
```

访问: http://localhost

**详细文档**: [DOCKER.md](./DOCKER.md)

### 方式二: PM2 (生产环境)

```bash
# 一键部署
./deploy.sh

# PM2管理
pm2 status
pm2 logs
pm2 restart all
```

### 方式三: 开发模式

```bash
# 安装依赖
make install

# 启动后端 (终端1)
make dev-backend

# 启动前端 (终端2)
make dev-frontend
```

## 📋 Makefile 命令

```bash
make help              # 查看所有命令

# Docker
make docker-up         # 启动Docker容器
make docker-down       # 停止Docker容器
make docker-logs       # 查看日志
make docker-restart    # 重启容器

# PM2
make pm2-deploy        # PM2部署
make pm2-logs          # 查看PM2日志
make pm2-restart       # 重启PM2服务

# 开发
make dev-backend       # 启动后端开发服务器
make dev-frontend      # 启动前端开发服务器

# 数据库
make db-migrate        # 运行数据库迁移
make db-studio         # 打开Prisma Studio

# 构建
make build             # 构建前后端
make install           # 安装所有依赖
```

## 📁 项目结构

```
sora/
├── backend/                # 后端服务 (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── api/           # API路由
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务逻辑
│   │   └── middleware/    # 中间件
│   ├── prisma/            # 数据库schema
│   └── Dockerfile
├── frontend/              # 前端应用 (React + Vite + Zustand)
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # 状态管理
│   │   └── services/      # API服务
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml     # Docker Compose配置
├── ecosystem.config.js    # PM2配置
├── Makefile              # 常用命令
├── deploy.sh             # PM2部署脚本
├── docker-start.sh       # Docker启动脚本
└── README.md             # 本文件
```

## 🎯 架构说明

### 视频生成流程

```
用户提交 → 创建Job → 后台处理 → 实时更新进度 → 完成
   ↓           ↓           ↓             ↓          ↓
 POST      pending    processing      40%→60%   completed
/videos               (后台async)     (轮询)    (展示视频)
```

### 后台处理

- ✅ 立即返回job ID，不阻塞请求
- ✅ 后台异步调用Sora API
- ✅ 实时解析stream并更新数据库
- ✅ 支持500/503自动重试
- ✅ 错误自动记录到数据库

### 前端轮询

- ✅ 每2秒轮询job状态
- ✅ 实时显示进度条
- ✅ 完成后自动停止轮询
- ✅ 失败显示错误信息

## 📊 API文档

### POST /api/videos
创建视频生成任务

```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一个美丽的日落场景",
    "orientation": "portrait"
  }'
```

**Response:**
```json
{
  "job": {
    "id": "uuid",
    "status": "pending",
    "progress": 0,
    "prompt": "一个美丽的日落场景"
  },
  "message": "Video generation started"
}
```

### GET /api/videos/jobs/:jobId
查询任务状态

```bash
curl http://localhost:3000/api/videos/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "id": "uuid",
  "status": "processing",
  "progress": 45,
  "videoId": null,
  "errorMessage": null
}
```

## 🔧 配置说明

### 环境变量 (.env)

```env
# Sora API (必填)
SORA_API_URL=http://your-sora-api/v1/chat/completions
SORA_API_TOKEN=your-token

# 数据库
POSTGRES_USER=sora
POSTGRES_PASSWORD=change_me  # 生产必改
POSTGRES_DB=sora_db

# JWT
JWT_SECRET=change_me  # 生产必改
JWT_EXPIRES_IN=7d

# 端口
BACKEND_PORT=3000
FRONTEND_PORT=80
```

## 📝 日志说明

### 后端日志格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 POST /api/videos
   User-Agent: Mozilla/5.0...
   Auth: Bearer eyJhbGciOiJI...
📤 POST /api/videos - 202 (45ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[API] POST /api/videos - User: uuid, Prompt: "测试"
[API] Job created: uuid
[Background] Starting processing for job uuid
[Background] Job uuid Progress: 10%
[Background] Job uuid Progress: 20%
...
[Background] Job uuid completed - Video ID: uuid
```

### 查看日志

```bash
# Docker
docker-compose logs -f backend

# PM2
pm2 logs sora-backend

# 开发模式
tail -f backend/logs/*.log
```

## 🐛 故障排查

### 任务卡在0%

**原因**: 旧的processing job未清理

**解决**: 重启服务会自动清理
```bash
docker-compose restart backend
# 或
pm2 restart sora-backend
```

### 500/503错误

**原因**: Sora API异常

**解决**: 
- 系统自动重试5次
- 检查SORA_API_URL和SORA_API_TOKEN
- 查看日志确认重试记录

### 前端连接失败

**解决**:
1. 检查`VITE_API_URL`配置
2. 检查CORS设置
3. 重启服务

## 🔐 安全建议

生产环境必须修改:
- ✅ `JWT_SECRET` - 使用强随机字符串
- ✅ `POSTGRES_PASSWORD` - 使用强密码
- ✅ 启用HTTPS
- ✅ 配置防火墙
- ✅ 定期备份数据库

## 📚 相关文档

- [Docker部署指南](./DOCKER.md)
- [API文档](./docs/API.md)
- [开发指南](./docs/DEVELOPMENT.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 License

MIT

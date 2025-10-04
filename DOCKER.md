# Docker 部署指南

## 🐳 快速开始

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
vim .env
```

**必须修改的配置:**
- `SORA_API_URL` - Sora API地址
- `SORA_API_TOKEN` - Sora API token
- `JWT_SECRET` - JWT密钥（生产环境必改）
- `POSTGRES_PASSWORD` - 数据库密码（生产环境必改）

### 2. 启动服务

```bash
# 一键启动
./docker-start.sh

# 或使用Makefile
make docker-deploy

# 或手动启动
docker-compose up -d
```

### 3. 访问应用

- **前端**: http://localhost
- **后端**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

## 📋 常用命令

### 使用Makefile (推荐)

```bash
make help              # 查看所有可用命令

# Docker命令
make docker-up         # 启动容器
make docker-down       # 停止容器
make docker-logs       # 查看日志
make docker-restart    # 重启容器
make docker-ps         # 查看容器状态
make docker-clean      # 清理容器和数据卷

# 开发命令
make dev-backend       # 启动后端开发服务器
make dev-frontend      # 启动前端开发服务器

# 数据库命令
make db-migrate        # 运行数据库迁移
make db-studio         # 打开Prisma Studio

# 构建命令
make build             # 构建前后端
make install           # 安装依赖
```

### 使用Docker Compose

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f              # 所有服务
docker-compose logs -f backend      # 仅后端
docker-compose logs -f frontend     # 仅前端
docker-compose logs -f postgres     # 仅数据库

# 重启服务
docker-compose restart              # 重启所有
docker-compose restart backend      # 重启后端

# 进入容器
docker-compose exec backend sh      # 进入后端容器
docker-compose exec postgres psql -U sora  # 进入数据库

# 停止并删除
docker-compose down                 # 停止并删除容器
docker-compose down -v              # 同时删除数据卷（⚠️ 会删除数据）
```

## 🏗️ 架构说明

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Frontend   │  │   Backend    │  │ Postgres  │ │
│  │   (Nginx)    │  │  (Node.js)   │  │    DB     │ │
│  │   Port: 80   │  │  Port: 3000  │  │ Port:5432 │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                 │                 │       │
└─────────┼─────────────────┼─────────────────┼───────┘
          │                 │                 │
          ▼                 ▼                 ▼
      Host:80          Host:3000         Host:5432
```

### 容器说明

1. **Frontend (Nginx)**
   - 基于Alpine Linux
   - 托管React构建产物
   - Gzip压缩
   - SPA路由支持

2. **Backend (Node.js)**
   - 基于Alpine Linux
   - 多阶段构建优化镜像大小
   - 自动运行数据库迁移
   - 健康检查

3. **Postgres**
   - PostgreSQL 15
   - 数据持久化到volume
   - 健康检查

## 🔧 环境变量说明

### 数据库配置
```env
POSTGRES_USER=sora              # 数据库用户名
POSTGRES_PASSWORD=...           # 数据库密码 (必改)
POSTGRES_DB=sora_db            # 数据库名
POSTGRES_PORT=5432             # 数据库端口
```

### 后端配置
```env
BACKEND_PORT=3000              # 后端端口
JWT_SECRET=...                 # JWT密钥 (必改)
JWT_EXPIRES_IN=7d             # Token过期时间
```

### Sora API配置
```env
SORA_API_URL=...              # Sora API地址 (必填)
SORA_API_TOKEN=...            # Sora API Token (必填)
```

### 前端配置
```env
FRONTEND_PORT=80              # 前端端口
VITE_API_URL=http://localhost:3000  # 后端API地址
```

## 🔍 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker-compose logs backend

# 查看容器状态
docker-compose ps

# 重建容器
docker-compose up -d --build --force-recreate
```

### 数据库连接失败

```bash
# 检查数据库是否健康
docker-compose ps postgres

# 进入数据库容器
docker-compose exec postgres psql -U sora

# 查看数据库日志
docker-compose logs postgres
```

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i:80
lsof -i:3000
lsof -i:5432

# 修改.env文件中的端口
vim .env
```

### 前端无法连接后端

检查环境变量:
```bash
# 前端容器中的API地址
docker-compose exec frontend env | grep VITE_API_URL

# 后端容器中的CORS设置
docker-compose exec backend env | grep FRONTEND_URL
```

## 📊 监控和日志

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

### 日志管理

日志存储在Docker volumes中:
```bash
# 查看volume列表
docker volume ls

# 查看后端日志volume
docker volume inspect sora_backend_logs
```

## 🚀 生产部署建议

1. **使用反向代理**
   ```nginx
   # Nginx配置示例
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:80;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
       }
   }
   ```

2. **启用HTTPS**
   - 使用Let's Encrypt
   - 配置SSL证书

3. **数据备份**
   ```bash
   # 备份数据库
   docker-compose exec postgres pg_dump -U sora sora_db > backup.sql
   
   # 恢复数据库
   cat backup.sql | docker-compose exec -T postgres psql -U sora sora_db
   ```

4. **日志轮转**
   配置Docker日志驱动:
   ```yaml
   # docker-compose.yml
   services:
     backend:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

## 🔄 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d

# 或一键更新
make docker-down && make docker-build && make docker-up
```

## 🧹 清理

```bash
# 删除容器（保留数据）
docker-compose down

# 删除容器和数据卷（⚠️ 会删除所有数据）
docker-compose down -v

# 清理未使用的镜像
docker image prune -a

# 清理所有未使用资源
docker system prune -a --volumes
```

## 💡 提示

- 首次启动可能需要几分钟来构建镜像
- 数据库迁移会在后端容器启动时自动运行
- 健康检查需要约40秒才能完成
- 修改.env后需要重新启动容器

## 📚 更多资源

- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [Nginx配置](https://nginx.org/en/docs/)

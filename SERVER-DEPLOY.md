# 🚀 服务器部署指南

## 前提条件

服务器需要安装：
- Docker 20.10+
- Docker Compose 2.0+
- Git

## 快速部署

### 1. 克隆代码

```bash
# SSH到你的服务器
ssh user@your-server.com

# 克隆仓库
git clone https://github.com/luzhipeng728/sora.git
cd sora
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置（重要！）
vim .env
```

**必须修改的配置：**
```env
# Sora API (必填)
SORA_API_URL=http://172.93.101.237:9800/sora/v1/chat/completions
SORA_API_TOKEN=31243dca-83b9-44dd-8181-6162430ae845

# 数据库密码 (生产环境必改)
POSTGRES_PASSWORD=your-strong-password-here

# JWT密钥 (生产环境必改)
JWT_SECRET=your-random-secret-key-min-32-chars

# 端口配置
BACKEND_PORT=3000
FRONTEND_PORT=80
```

### 3. 启动服务

```bash
# 给脚本执行权限
chmod +x docker-start.sh

# 一键启动
./docker-start.sh

# 或者手动启动
docker-compose up -d
```

### 4. 验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 检查健康状态
curl http://localhost:3000/health
```

### 5. 访问应用

- **前端**: http://your-server-ip
- **后端**: http://your-server-ip:3000

## 常用命令

```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f backend      # 后端日志
docker-compose logs -f frontend     # 前端日志
docker-compose logs -f postgres     # 数据库日志

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新代码
git pull
docker-compose build
docker-compose up -d

# 备份数据库
docker-compose exec postgres pg_dump -U sora sora_db > backup.sql

# 恢复数据库
cat backup.sql | docker-compose exec -T postgres psql -U sora sora_db
```

## 生产环境优化

### 1. 使用Nginx反向代理

创建 `/etc/nginx/sites-available/sora`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/sora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. 启用HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 防火墙配置

```bash
# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 如果需要直接访问后端
sudo ufw allow 3000/tcp

sudo ufw enable
```

### 4. 自动启动

Docker容器已配置`restart: unless-stopped`，服务器重启后会自动启动。

### 5. 日志轮转

编辑docker-compose.yml添加日志限制：

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 监控

### 查看资源使用

```bash
# 容器资源
docker stats

# 磁盘使用
docker system df

# 清理未使用镜像
docker system prune -a
```

### 查看实时日志

```bash
# 所有服务
docker-compose logs -f --tail=100

# 特定服务
docker-compose logs -f backend --tail=100
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 重建容器
docker-compose up -d --build --force-recreate
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose exec postgres psql -U sora

# 查看数据库日志
docker-compose logs postgres
```

### 端口被占用

```bash
# 查看端口占用
sudo lsof -i:80
sudo lsof -i:3000

# 修改.env中的端口
vim .env
docker-compose down
docker-compose up -d
```

## 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d

# 4. 查看状态
docker-compose ps
```

## 安全建议

1. **修改默认密码**
   - 数据库密码
   - JWT密钥

2. **使用HTTPS**
   - 配置SSL证书
   - 强制HTTPS重定向

3. **限制访问**
   - 配置防火墙
   - 使用私有网络

4. **定期备份**
   - 数据库备份
   - 代码备份
   - 环境变量备份

5. **监控日志**
   - 定期检查错误日志
   - 设置告警

## GitHub仓库

https://github.com/luzhipeng728/sora

## 需要帮助？

查看以下文档：
- [README.md](./README.md) - 项目概述
- [DOCKER.md](./DOCKER.md) - Docker详细文档
- [DOCKER-PROXY-FIX.md](./DOCKER-PROXY-FIX.md) - 代理问题解决

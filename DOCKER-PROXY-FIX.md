# Docker 代理配置问题解决方案

## 问题描述

构建Docker镜像时出现错误：
```
dial tcp 127.0.0.1:10902: connect: connection refused
```

原因：Docker Desktop配置了错误的代理端口(10902)，需要改为正确的代理端口。

## 解决方案

### 方法1: Docker Desktop GUI设置（推荐）

1. **打开Docker Desktop**
   - 点击Mac菜单栏的Docker图标

2. **进入设置**
   - 选择 **Settings** (⚙️图标)

3. **配置代理**
   - 进入 **Resources** → **Proxies**
   - 选择 **Manual proxy configuration**
   - 设置代理：
     ```
     Web Server (HTTP): http://127.0.0.1:10905
     Secure Web Server (HTTPS): http://127.0.0.1:10905
     ```
   - 或者如果不需要代理，选择 **System proxy** 或不勾选

4. **应用并重启**
   - 点击 **Apply & Restart**
   - 等待Docker重启完成

5. **验证**
   ```bash
   docker info | grep -i proxy
   ```

### 方法2: 使用正确的代理环境变量

如果你的代理运行在10905端口：

```bash
export https_proxy=http://127.0.0.1:10905
export http_proxy=http://127.0.0.1:10905
export all_proxy=socks5://127.0.0.1:10025

# 构建镜像
cd /Users/luzhipeng/projects/modal_maya/sora
docker-compose build
```

### 方法3: 不使用代理

如果你可以直接访问Docker Hub：

1. 在Docker Desktop中禁用代理
2. 或者使用以下命令：

```bash
unset https_proxy
unset http_proxy  
unset all_proxy
unset HTTP_PROXY
unset HTTPS_PROXY

docker-compose build
```

## 验证代理设置

```bash
# 查看当前代理配置
docker info | grep -i proxy

# 测试拉取镜像
docker pull node:18-alpine

# 如果成功，继续构建
docker-compose build
```

## 构建成功后

```bash
# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 常见错误

### 错误1: 代理端口错误
```
dial tcp 127.0.0.1:10902: connect: connection refused
```
**解决**: 在Docker Desktop中修改代理端口为正确的端口

### 错误2: 镜像拉取超时
```
timeout: failed to do request
```
**解决**: 检查代理是否正常运行，或尝试禁用代理

### 错误3: 证书错误
```
x509: certificate signed by unknown authority
```
**解决**: 在Docker Desktop代理设置中添加证书信任

## 当前正确的代理配置

根据你的环境：
- HTTP Proxy: `http://127.0.0.1:10905`
- HTTPS Proxy: `http://127.0.0.1:10905`
- SOCKS5 Proxy: `socks5://127.0.0.1:10025`

确保Docker Desktop使用这些配置！
